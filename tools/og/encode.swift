// Encodes 2x PNG frames into a 1200x630 H.264 MP4 (no audio, fast start), writes frame 0 as the og JPEG,
// and checks frame 0 and the loop seam the way og-video-preview does.
// usage: swift encode.swift FRAMES_DIR OUT.mp4 OUT.jpg [bitrate]
import AVFoundation
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let a = CommandLine.arguments
let dir = URL(fileURLWithPath: a[1]), mp4 = URL(fileURLWithPath: a[2]), jpg = URL(fileURLWithPath: a[3])
let bitrate = a.count > 4 ? Int(a[4])! : 1_600_000
let W = 1200, H = 630, fps: Int32 = 60
let files = try FileManager.default.contentsOfDirectory(atPath: dir.path).filter { $0.hasSuffix(".png") }.sorted()

func load(_ name: String) -> CGImage {
  let src = CGImageSourceCreateWithURL(dir.appendingPathComponent(name) as CFURL, nil)!
  return CGImageSourceCreateImageAtIndex(src, 0, nil)!
}
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
// high-quality downscale to 1200x630, as 8-bit RGBA bytes
func down(_ img: CGImage) -> (CGImage, [UInt8]) {
  var buf = [UInt8](repeating: 0, count: W * H * 4)
  let ctx = CGContext(data: &buf, width: W, height: H, bitsPerComponent: 8, bytesPerRow: W * 4, space: cs,
                      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.interpolationQuality = .high
  ctx.draw(img, in: CGRect(x: 0, y: 0, width: W, height: H))
  return (ctx.makeImage()!, buf)
}
func meanDiff(_ x: [UInt8], _ y: [UInt8]) -> Double {
  var s = 0; for i in stride(from: 0, to: x.count, by: 4) { s += abs(Int(x[i]) - Int(y[i])) + abs(Int(x[i+1]) - Int(y[i+1])) + abs(Int(x[i+2]) - Int(y[i+2])) }
  return Double(s) / Double(x.count / 4 * 3)
}

// frames, downscaled
var frames: [(CGImage, [UInt8])] = []
for f in files { frames.append(down(load(f))) }

// og JPEG from frame 0
let dest = CGImageDestinationCreateWithURL(jpg as CFURL, UTType.jpeg.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dest, frames[0].0, [kCGImageDestinationLossyCompressionQuality: 0.9] as CFDictionary)
CGImageDestinationFinalize(dest)

// MP4
try? FileManager.default.removeItem(at: mp4)
let w = try AVAssetWriter(outputURL: mp4, fileType: .mp4)
w.shouldOptimizeForNetworkUse = true
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: H,
  AVVideoColorPropertiesKey: [AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
                              AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
                              AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2],
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: bitrate, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
                                    AVVideoMaxKeyFrameIntervalKey: 60, AVVideoAllowFrameReorderingKey: true]])
input.expectsMediaDataInRealTime = false
let ad = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA, kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H])
w.add(input); w.startWriting(); w.startSession(atSourceTime: .zero)
for (i, fr) in frames.enumerated() {
  while !input.isReadyForMoreMediaData { usleep(2000) }
  var pb: CVPixelBuffer?; CVPixelBufferPoolCreatePixelBuffer(nil, ad.pixelBufferPool!, &pb)
  CVPixelBufferLockBaseAddress(pb!, [])
  let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb!), width: W, height: H, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pb!),
                      space: cs, bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
  ctx.draw(fr.0, in: CGRect(x: 0, y: 0, width: W, height: H))
  CVPixelBufferUnlockBaseAddress(pb!, [])
  ad.append(pb!, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps))
}
input.markAsFinished()
let sem = DispatchSemaphore(value: 0); w.finishWriting { sem.signal() }; sem.wait()
if w.status != .completed { print("write failed", w.error!); exit(1) }

// checks
var steps: [Double] = []; for i in 1..<frames.count { steps.append(meanDiff(frames[i-1].1, frames[i].1)) }
let seam = meanDiff(frames.last!.1, frames[0].1)
let typical = steps.sorted()[steps.count / 2], maxStep = steps.max()!
let motion = frames.map { meanDiff($0.1, frames[0].1) }.max()!
// frame 0 as decoded from the MP4, against the JPEG
let gen = AVAssetImageGenerator(asset: AVURLAsset(url: mp4)); gen.requestedTimeToleranceBefore = .zero; gen.requestedTimeToleranceAfter = .zero
let f0 = try gen.copyCGImage(at: .zero, actualTime: nil)
let jsrc = CGImageSourceCreateWithURL(jpg as CFURL, nil)!, jimg = CGImageSourceCreateImageAtIndex(jsrc, 0, nil)!
let d0 = meanDiff(down(f0).1, down(jimg).1)
let size = (try FileManager.default.attributesOfItem(atPath: mp4.path)[.size] as! Int)
let jsize = (try FileManager.default.attributesOfItem(atPath: jpg.path)[.size] as! Int)
print(String(format: "frames %d  mp4 %d KB  jpg %d KB", frames.count, size / 1024, jsize / 1024))
print(String(format: "frame0 (mp4 vs jpg) mean diff %.2f  [pass ≤ 2]", d0))
print(String(format: "seam %.3f  vs largest step %.3f, median step %.3f  [pass ≤ 1.5×largest + slack]", seam, maxStep, typical))
print(String(format: "motion max diff from frame 0 %.2f  [pass ≥ 0.2]", motion))
