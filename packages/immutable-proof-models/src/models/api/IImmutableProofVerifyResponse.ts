// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ImmutableProofFailure } from "../immutableProofFailure";

/**
 * Response to verifying an immutable proof.
 */
export interface IImmutableProofVerifyResponse {
	/**
	 * The response body.
	 */
	body: {
		/**
		 * Was the proof verified.
		 */
		verified: boolean;

		/**
		 * If not verified what was the failure.
		 */
		failure?: ImmutableProofFailure;
	};
}
