import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';
import { Repository } from 'typeorm';
import { VehicleCategory, VehicleStatus } from '../common/enums/index';

const fleet = [
  {
    make_ar: 'مرسيدس-بنز',
    make_en: 'Mercedes-Benz',
    model_ar: 'جي 63 ايه ام جي',
    model_en: 'G63 AMG',
    year: 2024,
    category: VehicleCategory.SUV,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 1500,
    sale_price: 12000000,
    description_ar: 'مارسيدس جي 63 ايه ام جي هي أيقونة الفخامة والقوة، تتميز بمحرك V8 قوي وتصميم خارجي كلاسيكي مع مقصورة داخلية فائقة الحداثة.',
    description_en: 'The Mercedes-Benz G63 AMG is an icon of luxury and power, featuring a potent V8 engine and a classic exterior design with an ultra-modern interior.',
    image_urls: ['g63.png'],
    details: { engine: '4.0L V8 Biturbo', hp: 577, transmission: '9-speed automatic', acceleration: '4.5s' },
  },
  {
    make_ar: 'رولز-رويس',
    make_en: 'Rolls-Royce',
    model_ar: 'جوست',
    model_en: 'Ghost',
    year: 2024,
    category: VehicleCategory.LUXURY,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 3500,
    sale_price: 25000000,
    description_ar: 'رولز رويس جوست تجسد قمة الرفاهية والهدوء على الطريق، بفضل محركها المكون من 12 أسطوانة ونظام التعليق الذي يشعرك كأنك فوق سحابة.',
    description_en: 'The Rolls-Royce Ghost embodies the pinnacle of luxury and serenity on the road, powered by a V12 engine and a suspension that feels like floating on a cloud.',
    image_urls: ['ghost.png'],
    details: { engine: '6.75L V12', hp: 563, transmission: '8-speed automatic', acceleration: '4.8s' },
  },
  {
    make_ar: 'بنتلي',
    make_en: 'Bentley',
    model_ar: 'بينتايجا',
    model_en: 'Bentayga',
    year: 2024,
    category: VehicleCategory.SUV,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 2200,
    sale_price: 18000000,
    description_ar: 'بينتلي بينتايجا هي سيارة الدفع الرباعي الفاخرة الأسرع والأكثر رقيًا، تجمع بين الحرفية البريطانية التقليدية والأداء الرياضي المذهل.',
    description_en: 'The Bentley Bentayga is the fastest and most refined luxury SUV, combining traditional British craftsmanship with breathtaking performance.',
    image_urls: ['bentayga.png'],
    details: { engine: '4.0L V8', hp: 542, transmission: '8-speed automatic', acceleration: '4.4s' },
  },
  {
    make_ar: 'بورشه',
    make_en: 'Porsche',
    model_ar: '911 تيربو اس',
    model_en: '911 Turbo S',
    year: 2024,
    category: VehicleCategory.SPORT,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 2500,
    sale_price: 15000000,
    description_ar: 'بورشه 911 تيربو اس هي تعريف السيارة الرياضية الفائقة، تقدم أداءاً مذهلاً على الحلبة وراحة لا مثيل لها في القيادة اليومية.',
    description_en: 'The Porsche 911 Turbo S is the definition of a supercar, offering mind-bending track performance and daily usability.',
    image_urls: ['porsche911.png'],
    details: { engine: '3.8L Flat-6 Twin-Turbo', hp: 640, transmission: '8-speed PDK', acceleration: '2.7s' },
  },
  {
    make_ar: 'أودي',
    make_en: 'Audi',
    model_ar: 'ار اس كيو 8',
    model_en: 'RS Q8',
    year: 2024,
    category: VehicleCategory.SPORT,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 1800,
    sale_price: 10000000,
    description_ar: 'أودي RS Q8 هي أقوى سيارة دفع رباعي من أودي سبورت، تجمع بين قوة السيارات الخارقة وعملية سيارات الدفع الرباعي العائلية.',
    description_en: 'The Audi RS Q8 is the most powerful SUV from Audi Sport, combining supercar power with the practicality of a family SUV.',
    image_urls: ['rsq8.png'],
    details: { engine: '4.0L V8 Twin-Turbo', hp: 591, transmission: '8-speed automatic', acceleration: '3.8s' },
  },
  {
    make_ar: 'لامبورجيني',
    make_en: 'Lamborghini',
    model_ar: 'أوروس',
    model_en: 'Urus',
    year: 2024,
    category: VehicleCategory.SUV,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 3000,
    sale_price: 22000000,
    description_ar: 'لامبورجيني أوروس هي أول سيارة دفع رباعي فائقة في العالم، تجمع بين روح السيارة الرياضية الخارقة ووظائف السيارة الرياضية متعددة الاستخدامات.',
    description_en: 'The Lamborghini Urus is the world’s first Super Sport Utility Vehicle, merging the soul of a super sports car with the functionality of an SUV.',
    image_urls: ['urus.png'],
    details: { engine: '4.0L V8 Twin-Turbo', hp: 641, transmission: '8-speed automatic', acceleration: '3.6s' },
  },
  {
    make_ar: 'فيراري',
    make_en: 'Ferrari',
    model_ar: 'SF90 سترادال',
    model_en: 'SF90 Stradale',
    year: 2024,
    category: VehicleCategory.SPORT,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 4500,
    sale_price: 35000000,
    description_ar: 'فيراري SF90 سترادال تمثل قمة الأداء الهجين من فيراري، حيث تلتقي التكنولوجيا المتطورة مع العاطفة الإيطالية الخارقة.',
    description_en: 'The Ferrari SF90 Stradale represents the pinnacle of hybrid performance from Ferrari, where cutting-edge technology meets Italian supercar passion.',
    image_urls: ['https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800'],
    details: { engine: '4.0L V8 Hybrid', hp: 986, transmission: '8-speed dual-clutch', acceleration: '2.5s' },
  },
  {
    make_ar: 'رينج روفر',
    make_en: 'Range Rover',
    model_ar: 'إس في',
    model_en: 'SV',
    year: 2024,
    category: VehicleCategory.LUXURY,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 2800,
    sale_price: 15000000,
    description_ar: 'رينج روفر SV هي التجسيد النهائي للفخامة والقدرة على جميع التضاريس، مع اهتمام لا يضاهى بالتفاصيل والراحة.',
    description_en: 'The Range Rover SV is the ultimate expression of luxury and all-terrain capability, with peerless attention to detail and comfort.',
    image_urls: ['https://images.unsplash.com/photo-1627236021021-f09591e0a811?auto=format&fit=crop&q=80&w=800'],
    details: { engine: '4.4L V8 Twin-Turbo', hp: 523, transmission: '8-speed automatic', acceleration: '4.6s' },
  },
  {
    make_ar: 'ماكلارين',
    make_en: 'McLaren',
    model_ar: '720S',
    model_en: '720S',
    year: 2024,
    category: VehicleCategory.SPORT,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 3200,
    sale_price: 18000000,
    description_ar: 'ماكلارين 720S تتحدى القوانين الفيزيائية بأدائها المذهل وتصميمها المستقبلي الذي يركز بالكامل على السرعة والتحكم.',
    description_en: 'The McLaren 720S defies physical laws with its incredible performance and futuristic design focused entirely on speed and control.',
    image_urls: ['https://images.unsplash.com/photo-1625235186291-ca9276964177?auto=format&fit=crop&q=80&w=800'],
    details: { engine: '4.0L V8 Twin-Turbo', hp: 710, transmission: '7-speed dual-clutch', acceleration: '2.8s' },
  },
  {
    make_ar: 'كاديلاك',
    make_en: 'Cadillac',
    model_ar: 'إسكاليد-V',
    model_en: 'Escalade-V',
    year: 2024,
    category: VehicleCategory.LUXURY,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 2000,
    sale_price: 12000000,
    description_ar: 'كاديلاك إسكاليد-V هي أقوى سيارة دفع رباعي كاملة الحجم من كاديلاك، تجمع بين الفخامة الرئاسية والقوة الهائلة بمحرك سوبرشارجد.',
    description_en: 'The Cadillac Escalade-V is the most powerful full-size SUV from Cadillac, combining presidential luxury with massive supercharged power.',
    image_urls: ['https://images.unsplash.com/photo-1579730626359-54854c6e61be?auto=format&fit=crop&q=80&w=800'],
    details: { engine: '6.2L V8 Supercharged', hp: 682, transmission: '10-speed automatic', acceleration: '4.4s' },
  },
];

async function bootstrap() {
  console.log('Starting Master Fleet Seeding (10 Cars)...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const repo = app.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));

  // Optional: Clear existing seeded cars if names match to avoid duplicates, or just clean up paths
  for (const vehicleData of fleet) {
    const existing = await repo.findOne({
      where: { make_en: vehicleData.make_en, model_en: vehicleData.model_en, year: vehicleData.year }
    });

    if (existing) {
       // Update existing with correct data and image paths
       Object.assign(existing, vehicleData);
       await repo.save(existing);
       console.log(`Updated: ${vehicleData.make_en} ${vehicleData.model_en}`);
    } else {
      const vehicle = repo.create(vehicleData as any);
      await repo.save(vehicle);
      console.log(`Added New: ${vehicleData.make_en} ${vehicleData.model_en}`);
    }
  }

  await app.close();
  console.log('Master Seeding complete.');
}

bootstrap().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
