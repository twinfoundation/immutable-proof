// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import type { HeaderTypes, MimeTypes } from "@twin.org/web";

/**
 * Verify a proof.
 */
export interface IImmutableProofVerifyRequest {
	/**
	 * The headers which can be used to determine the response data type.
	 */
	headers?: {
		[HeaderTypes.Accept]: typeof MimeTypes.Json | typeof MimeTypes.JsonLd;
	};

	/**
	 * The parameters from the path.
	 */
	pathParams: {
		/**
		 * The id of the immutable proof to verify.
		 */
		id: string;
	};

	/**
	 * The parameters from the body.
	 */
	body: {
		/**
		 * The proof object to verify.
		 */
		proofObject: IJsonLdNodeObject;
	};
}
