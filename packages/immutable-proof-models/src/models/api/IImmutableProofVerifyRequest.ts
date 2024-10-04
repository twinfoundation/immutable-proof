// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";

/**
 * Verify a proof.
 */
export interface IImmutableProofVerifyRequest {
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
