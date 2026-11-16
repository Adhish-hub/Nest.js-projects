import { Transform, Type } from "class-transformer";

import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreatePostDto{
    @Transform(({value}) => 
      typeof value === "string" ? value.trim() : value,
    )
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    title!: string;

    @Transform(({value}) => 
      typeof value === "string" ? value.trim() : value,
    )
    @IsString()
    @IsNotEmpty()
    @MaxLength(20000)
    content!: string;

    @Transform(({value}) => 
      typeof value === "string" ? value.trim().toLowerCase() : value,
    )
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    category!: string;

    @IsMongoId()
    authorId!: string;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    published?: boolean;
}