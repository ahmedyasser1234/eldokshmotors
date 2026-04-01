import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleFactory } from './vehicle.factory';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService implements OnModuleInit {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async onModuleInit() {
    const vehicles = await this.vehicleRepository.find();
    for (const v of vehicles) {
      // Removed legacy fallback logic for brand/model generation

      // NEW: Normalize image_urls (Strip trailing slashes + ensure correct prefix)
      if (v.image_urls && v.image_urls.length > 0) {
        const cleanedUrls = v.image_urls.map(url => {
            if (typeof url !== 'string') return url;
            let cleaned = url.trim();
            
            // Remove erroneous trailing slashes
            while (cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
            
            // Handing for local vs cloud paths
            if (cleaned && !cleaned.startsWith('http')) {
              // Only prepend /uploads/ if it's clearly a local filename and not already prefixed
              if (!cleaned.includes('/uploads/') && !cleaned.startsWith('cloudinary')) {
                const filename = cleaned.split('/').pop();
                if (filename) {
                  cleaned = `/uploads/vehicles/${filename}`;
                }
              } else if (cleaned.startsWith('uploads/') || cleaned.startsWith('public/')) {
                cleaned = '/' + cleaned.replace('public/', '');
              }
            }
            return cleaned;
        });
        
        // Check if any url actually changed
        const hasChanges = JSON.stringify(v.image_urls) !== JSON.stringify(cleanedUrls);
        if (hasChanges) {
            v.image_urls = cleanedUrls;
        }
      }

      await this.vehicleRepository.save(v);
    }
  }

  async create(createVehicleDto: CreateVehicleDto) {
    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async findAll(filters: any = {}) {
    const query = this.vehicleRepository.createQueryBuilder('vehicle');

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query.andWhere(
        new Brackets((qb) => {
          qb.where('vehicle.make_en ILIKE :search', { search: searchTerm })
            .orWhere('vehicle.make_ar ILIKE :search', { search: searchTerm })
            .orWhere('vehicle.model_en ILIKE :search', { search: searchTerm })
            .orWhere('vehicle.model_ar ILIKE :search', { search: searchTerm })
            .orWhere("CAST(vehicle.details AS TEXT) ILIKE :search", { search: searchTerm });
        }),
      );
    }

    if (filters.category) {
      query.andWhere('vehicle.category = :category', { category: filters.category });
    }

    if (filters.status) {
      query.andWhere('vehicle.status = :status', { status: filters.status });
    }

    if (filters.minPrice) {
      query.andWhere('vehicle.sale_price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice) {
      query.andWhere('vehicle.sale_price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.limit) {
      query.take(filters.limit);
    }
    
    if (filters.offset) {
      query.skip(filters.offset);
    }

    if (filters.sort) {
      const [field, order] = filters.sort.split(':');
      const sortOrder = order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      // Map common camelCase properties to snake_case column names if needed
      let sortField = field;
      if (field === 'createdAt') sortField = 'created_at';
      if (field === 'salePrice') sortField = 'sale_price';
      
      query.orderBy(`vehicle.${sortField}`, sortOrder);
    } else {
      query.orderBy('vehicle.created_at', 'DESC');
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string) {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    
    // Check if it's a rental or sale vehicle for specific factory logic
    const factoryVehicle = VehicleFactory.create(vehicle);
    return {
      ...vehicle,
      type: factoryVehicle.getType(),
      specificDetails: factoryVehicle.getDetails(),
    };
  }

  async update(id: string, updateVehicleDto: any) {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    
    Object.assign(vehicle, updateVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: string) {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return this.vehicleRepository.remove(vehicle);
  }
}
