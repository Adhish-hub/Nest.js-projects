import { Transform } from "class-transformer";

import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateStudentDto {
    @Transform(({value}) => 
      typeof value === "string" ? value.trim() : value,  
    )
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name!: string;

    @Transform(({value}) =>
      typeof value === "string" ? value.trim() : value,
    )

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    course!: string;
}