import sharp from 'sharp';

const createIcon = async (size: number, outputPath: string) => {
  // Create a blue rounded rectangle with white "K" text
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="#3B82F6" rx="${size * 0.125}"/>
      <text x="${size / 2}" y="${size * 0.72}" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" fill="white" text-anchor="middle">K</text>
    </svg>
  `;

  await sharp(Buffer.from(svgIcon))
    .resize(size, size)
    .png()
    .toFile(outputPath);

  console.log(`Created ${outputPath}`);
};

const main = async () => {
  await createIcon(16, 'public/icons/icon16.png');
  await createIcon(48, 'public/icons/icon48.png');
  await createIcon(128, 'public/icons/icon128.png');
};

main().catch(console.error);