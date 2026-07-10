import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async create(createVendorDto: CreateVendorDto) {
    const vendor = await this.prisma.itVendor.create({
      data: {
        ...createVendorDto,
        contractStart: new Date(createVendorDto.contractStart),
        contractEnd: new Date(createVendorDto.contractEnd),
        status: 'ACTIVE',
      },
    });
    return {
      success: true,
      message: 'Vendor IT baru berhasil didaftarkan! 🤝',
      data: vendor,
    };
  }

  async findAll() {
    const vendors = await this.prisma.itVendor.findMany({
      orderBy: { contractEnd: 'asc' }, // Urutkan dari yang kontraknya paling cepat habis
    });
    return {
      success: true,
      data: vendors,
    };
  }

  async findOne(id: number) {
    const vendor = await this.prisma.itVendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException(`Vendor #${id} tidak ditemukan!`);
    return {
      success: true,
      data: vendor,
    };
  }

  async update(id: number, updateVendorDto: UpdateVendorDto) {
    await this.findOne(id);
    const updated = await this.prisma.itVendor.update({
      where: { id },
      data: {
        ...updateVendorDto,
        contractStart: updateVendorDto.contractStart ? new Date(updateVendorDto.contractStart) : undefined,
        contractEnd: updateVendorDto.contractEnd ? new Date(updateVendorDto.contractEnd) : undefined,
      },
    });
    return {
      success: true,
      message: 'Data vendor berhasil diperbarui!',
      data: updated,
    };
  }
}
