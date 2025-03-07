// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ImmutableProofContexts } from "./immutableProofContexts";
import type { ImmutableProofFailure } from "./immutableProofFailure";
import type { ImmutableProofTypes } from "./immutableProofTypes";

/**
 * Interface describing an immutable proof verification.
 */
export interface IImmutableProofVerification {
	/**
	 * JSON-LD Context.
	 */
	"@context": typeof ImmutableProofContexts.ContextRoot;

	/**
	 * JSON-LD Type.
	 */
	type: typeof ImmutableProofTypes.ImmutableProofVerification;

	/**
	 * Was the verification successful.
	 */
	verified: boolean;

	/**
	 * If the verification was unsuccessful the failure reason.
	 */
	failure?: ImmutableProofFailure;
}
