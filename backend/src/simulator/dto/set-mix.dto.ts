import { IsInt, Max, Min } from 'class-validator';

export class SetMixDto {
  /** Procentul dorit pentru Glovo (0-100). Bolt Food primeste restul. */
  @IsInt()
  @Min(0)
  @Max(100)
  glovo: number;
}
