import { Injectable, InternalServerErrorException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create( createProductDto );
      await this.productRepository.save( product );

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    const [ counts, products ] = await Promise.all([
      this.productRepository.count(),
      this.productRepository.find()
    ]);

    return { counts, products };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy( { id } );

    if( !product ) throw new NotFoundException(`El producto con el id: ${ id } no existe.`);

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productRepository.remove( product );
  }

  private handleDBExceptions = ( error: any ) => {
    if(error.code === '23505') {
      throw new BadRequestException( error.detail );
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Ocurrió un error, verifiqué los logs.');
  }
}
