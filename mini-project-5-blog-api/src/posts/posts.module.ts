import { Module } from "@nestjs/common";

import { MongooseModule } from "@nestjs/mongoose";

import { PostsController } from "./posts.controller.js";
import { PostsService } from "./posts.service.js";
import { Post, PostSchema } from "@nestjs/common";
import { User, UserSchema } from "../users/schemas/user.schema.js";

@Module({
    imports: [
        MongooseModule.forFeature([
              {
            name: Post.name,
            schema: PostSchema,
        },
        {
            name: User.name,
            schema: UserSchema,
        },
        ]),
    ],

    controllers: [PostsController],
    providers: [PostsService],
})

export class PostsModule {}