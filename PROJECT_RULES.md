⸻

📄 PROJECT_RULES.md

# PROJECT RULES — NestJS Backend (subscriptions-api)

These rules describe how all code in this project must be written.  
Cursor (AI) must strictly follow these rules when generating or modifying code.

---

## 1. Architecture Principles

- Use **NestJS** with clean layered architecture:
  - `Module` → imports & providers
  - `Controller` → HTTP routes only
  - `Service` → business logic & DB operations
  - `Entity` → TypeORM schema
  - `DTO` → request/response shapes
- Controllers must be very thin.
- Services contain all logic.
- Entities contain zero business logic.
- Use TypeScript strict mode compatible code.
- Code must be consistent and strongly typed.

---

## 2. Folder Structure (Required)

src/
main.ts
app.module.ts

common/
base-response.ts

auth/
auth.module.ts
auth.service.ts
auth.controller.ts
jwt.strategy.ts
dto/
register.dto.ts
login.dto.ts
refresh-token.dto.ts
auth-response.dto.ts

users/
user.entity.ts
dto/
user-response.dto.ts

subscriptions/
subscriptions.module.ts
subscriptions.service.ts
subscriptions.controller.ts
subscription.entity.ts
dto/
create-subscription.dto.ts
update-subscription.dto.ts
subscription-response.dto.ts

All new features must follow this pattern.

---

## 3. TypeORM Rules

- Entities represent database schema only.
- No business logic in entities.
- Recommended column types:
  - `string` → `varchar`
  - `number` → `int` or `numeric`
  - `Date` → `timestamp` or `date`
- Use `onDelete: 'CASCADE'` where needed.
- Relations must be properly configured:
  - `ManyToOne` must have inverse `OneToMany`.

Example:

```ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpires?: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}


⸻

4. DTO Rules
	•	All incoming request bodies must use DTOs.
	•	DTOs must use class-validator decorators.
	•	DTOs must use Swagger decorators.
	•	DTOs must not contain entity logic.

Example:

export class CreateSubscriptionDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'])
  billingCycle: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

  @ApiProperty()
  @IsDateString()
  firstPaymentDate: string;
}


⸻

5. Base Response Model (Required)

Every successful API response MUST use BaseResponse<T>.

src/common/base-response.ts:

import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty({ nullable: true })
  data: T | null;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;

  constructor(
    success: boolean,
    statusCode: number,
    message: string,
    data?: T | null,
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data ?? null;
    this.timestamp = new Date().toISOString();
  }
}

export function success<T>(
  data: T,
  message = 'Operation successful',
  statusCode = 200,
): BaseResponse<T> {
  return new BaseResponse<T>(true, statusCode, message, data);
}

Controllers MUST use:

return success(result, 'Message');

Controllers must never return raw entities or plain objects.

⸻

6. Controller Rules
	•	Controllers must be thin.
	•	No business logic in controllers.
	•	Controllers must call Services only.
	•	Controllers must return BaseResponse<T>.

Example:

@Post()
async create(@Body() dto: CreateSubscriptionDto, @Req() req)
  : Promise<BaseResponse<SubscriptionResponseDto>> {
  const result = await this.subsService.createForUser(req.user.userId, dto);
  return success(result, 'Subscription created', 201);
}

	•	Apply these decorators:
	•	@ApiTags()
	•	@ApiBearerAuth()
	•	@ApiOperation()
	•	@ApiOkResponse(), @ApiCreatedResponse(), etc.
	•	@UseGuards(AuthGuard('jwt'))

⸻

7. Service Rules
	•	Services contain ALL business logic.
	•	Services return raw results (entity or mapped DTO).
	•	Services must not return BaseResponse.
	•	Services should:
	•	Validate ownership
	•	Perform DB operations
	•	Throw Nest exceptions

Example:

async findOneForUser(userId: number, id: number) {
  const sub = await this.repo.findOne({ where: { id }, relations: ['user'] });
  if (!sub) throw new NotFoundException('Subscription not found');
  if (sub.user.id !== userId)
    throw new ForbiddenException('Access denied');
  return sub;
}


⸻

8. Auth Rules (Access + Refresh Token)
	•	Use email + password login.
	•	Passwords must be hashed using bcrypt.
	•	Access token:
	•	Short-lived (from .env, e.g. 15 minutes)
	•	Refresh token:
	•	Long-lived (7 days)
	•	Must be hashed before storing
	•	User entity must include:
	•	refreshToken
	•	refreshTokenExpires
	•	Required endpoints:

POST /auth/register
POST /auth/login
POST /auth/refresh

	•	Use JwtStrategy and passport-jwt.
	•	Protect routes with:
	•	@UseGuards(AuthGuard('jwt'))
	•	@ApiBearerAuth()

⸻

9. Swagger Rules
	•	Swagger must be initialized in main.ts.
	•	All DTO fields must use @ApiProperty or @ApiPropertyOptional.
	•	Controllers must specify:
	•	@ApiTags()
	•	@ApiOperation()
	•	@ApiOkResponse()
	•	@ApiCreatedResponse()
	•	etc.

⸻

10. Error Handling
	•	Use Nest exceptions:
	•	BadRequestException
	•	UnauthorizedException
	•	ForbiddenException
	•	NotFoundException
	•	Do NOT manually return error objects.
	•	(Optional) Add a global exception filter to wrap errors into BaseResponse format.

⸻

11. Naming Conventions
	•	PascalCase → classes, DTOs, entities
	•	camelCase → variables and properties
	•	kebab-case → file names:
	•	auth.service.ts
	•	subscription.entity.ts
	•	user-response.dto.ts

⸻

12. Rules for Cursor AI

When generating or editing code:
	1.	Follow project folder structure exactly.
	2.	Always create DTOs for incoming data.
	3.	Always return BaseResponse from controllers.
	4.	Never put logic in controllers.
	5.	Never return plain objects or entities without wrapping.
	6.	Use TypeORM entities properly.
	7.	Keep all naming consistent.
	8.	Use Swagger decorators everywhere.
	9.	Apply class-validator decorators in every DTO.
	10.	Follow all Auth and Response model conventions.

⸻

END OF PROJECT RULES

---