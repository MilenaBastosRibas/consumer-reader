import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MEASURE_TYPES } from './measure.interfaces';

@Entity()
export class MeasureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50 })
  customer_code: string;

  @Column('datetime')
  measurement_datetime: Date;

  @Column('text')
  type: MEASURE_TYPES;

  @Column('text', { nullable: true })
  image_name: string;

  @Column('decimal', { nullable: true, precision: 10, scale: 3 })
  measurement_value: number;

  @Column('boolean', { default: false })
  has_confirmed: boolean;
}