import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyName: string;

  @Column()
  companyId: string;

  @Column()
  companyPhone: string;

  @Column()
  customerName: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column('json')
  tableData: {
    headers: Array<{
      id: string;
      label: string;
      isVisible: boolean;
    }>;
    rows: Array<{
      id: string;
      service: string;
      quantity: number;
      price: number;
      [key: string]: any;
    }>;
  };

  @Column({ default: true })
  showPrices: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
