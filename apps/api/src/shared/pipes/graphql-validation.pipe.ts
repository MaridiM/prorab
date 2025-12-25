import { ValidationPipe, ArgumentMetadata } from '@nestjs/common';

/**
 * Custom ValidationPipe that skips transformation for GraphQLUpload (Promise<FileUpload>)
 * This prevents the "Promise resolver undefined is not a function" error
 */
export class GraphQLValidationPipe extends ValidationPipe {
	transform(value: any, metadata: ArgumentMetadata) {
		const { metatype } = metadata;
		
		// Skip transformation for Promise types (GraphQLUpload is Promise<FileUpload>)
		if (value instanceof Promise || (value && typeof value.then === 'function')) {
			return value;
		}

		// Skip transformation if value is already a FileUpload-like object
		if (value && typeof value === 'object' && 'createReadStream' in value) {
			return value;
		}

		// Skip transformation if metatype is Promise
		if (metatype && (metatype === Promise || metatype.name === 'Promise')) {
			return value;
		}

		// For all other cases, use the parent ValidationPipe logic
		return super.transform(value, metadata);
	}
}

