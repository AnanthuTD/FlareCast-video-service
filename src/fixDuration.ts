import { execSync } from 'child_process';
import { renameSync, unlinkSync } from 'fs';

export async function fixWebMDuration(inputPath: string, outputPath: string) {
  console.log(inputPath, outputPath);
  // Step 1: Remux the WebM file (no re-encoding)
  try {
    execSync(`ffmpeg -i "${inputPath}" -c copy "${outputPath}"`);
    console.log(`WebM file remuxed successfully: ${outputPath}`);

    unlinkSync(inputPath)
    renameSync(outputPath, inputPath);
  } catch (error) {
    console.error('Error during remuxing the WebM file:', error);
    return;
  }

  // Step 2: Get the duration of the remuxed WebM file
  try {
    const duration = execSync(`ffprobe -i "${inputPath}" -show_entries format=duration -v quiet -of csv="p=0"`)
      .toString()
      .trim();

    if (duration === 'N/A') {
      console.log('Unable to get the duration from the remuxed WebM file.');
    } else {
      console.log(`Duration of the remuxed WebM file: ${duration} seconds`);
    }

    return duration
  } catch (error) {
    console.error('Error during getting duration of the WebM file:', error);
  }
}

/* fixWebMDuration("C:\\Users\\anant\\OneDrive\\Desktop\\Brocamp\\second project\\server\\video-service\\temp_upload\\38ce4d1f-1425-4ed8-a3b7-dbc2611b8c60-57e3879e.webm",
  "C:\\Users\\anant\\OneDrive\\Desktop\\Brocamp\\second project\\server\\video-service\\remuxed_video\\c65ac079-8ab3-460f-898d-b1f557629113.webm"
)
 */