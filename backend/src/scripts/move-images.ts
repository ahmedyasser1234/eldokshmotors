import * as fs from 'fs';
import * as path from 'path';

const frontendPublic = 'c:\\Users\\hp\\Desktop\\Ahmed\\new rent\\frontend\\public';
const backendUploads = 'c:\\Users\\hp\\Desktop\\Ahmed\\new rent\\backend\\public\\uploads\\vehicles';
const brainDir = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\be1278c7-5712-46f0-b769-d514c470c191';

// Ensure backend directory exists
if (!fs.existsSync(backendUploads)) {
  fs.mkdirSync(backendUploads, { recursive: true });
}

const filesToMove = [
    // Previous ones from frontend public (if any remained)
    { src: path.join(frontendPublic, 'g63.png'), dest: 'g63.png' },
    { src: path.join(frontendPublic, 'ghost.png'), dest: 'ghost.png' },
    { src: path.join(frontendPublic, 'bentayga.png'), dest: 'bentayga.png' },
    { src: path.join(frontendPublic, 'porsche911.png'), dest: 'porsche911.png' },
    { src: path.join(frontendPublic, 'rsq8.png'), dest: 'rsq8.png' },
    // New ones from brain dir
    { src: path.join(brainDir, 'lamborghini_urus_front_main_1774993970529.png'), dest: 'urus.png' },
    // Also check brain dir for the old ones just in case they aren't in frontend public
    { src: path.join(brainDir, 'mercedes_g63_amg_front_main_1774992205678.png'), dest: 'g63.png' },
    { src: path.join(brainDir, 'rolls_royce_ghost_front_main_1774992219506.png'), dest: 'ghost.png' },
    { src: path.join(brainDir, 'bentley_bentayga_front_main_1774992251486.png'), dest: 'bentayga.png' },
    { src: path.join(brainDir, 'porsche_911_turbo_s_front_main_1774992348228.png'), dest: 'porsche911.png' },
    { src: path.join(brainDir, 'audi_rs_q8_front_main_1774992364138.png'), dest: 'rsq8.png' },
];

filesToMove.forEach(file => {
  if (fs.existsSync(file.src)) {
    const destPath = path.join(backendUploads, file.dest);
    fs.copyFileSync(file.src, destPath);
    console.log(`Copied ${file.src} to ${destPath}`);
  } else {
    console.log(`Skipping ${file.src} (not found)`);
  }
});

console.log('File movement completed.');
