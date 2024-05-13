import { Entity, Index, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity()
export class User {

   @PrimaryKey()
   id!: number;

   @Property()
   @Index()
   @Unique()
   name!: string;

   @Property()
   pass!: string;
}