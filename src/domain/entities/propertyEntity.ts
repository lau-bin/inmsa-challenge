import { Entity, Index, PrimaryKey, Property, TextType, Unique } from '@mikro-orm/core';

@Entity()
export class PropertyEntity {

   @PrimaryKey()
   id!: number;

   @Property({type: TextType})
   description?: string;

   @Property()
   @Index()
   @Unique()
   name!: string;
}