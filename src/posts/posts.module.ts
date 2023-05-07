import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FilterModule } from 'src/filter/filter.module';
import { ImagesModule } from 'src/images/images.module';
import { UsersModule } from 'src/users/users.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [UsersModule, JwtModule, ImagesModule, FilterModule],
  controllers: [PostsController],
  providers: [PostsService, Logger],
})
export class PostsModule {}
