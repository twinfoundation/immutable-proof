// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";

/**
 * Create a proof.
 */
export interface IImmutableProofCreateRequest {
	/**
	 * The parameters from the body.
	 */
	body: {
		/**
		 * The document to create the proof for.
		 */
		document: IJsonLdNodeObject;
	};
}
