// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The failure reason of the proof.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ImmutableProofFailure = {
	/**
	 * Proof not yet issued.
	 */
	NotIssued: "notIssued",

	/**
	 * Proof missing.
	 */
	ProofMissing: "proofMissing",

	/**
	 * Crypto suite mismatch.
	 */
	CryptoSuiteMismatch: "cryptoSuiteMismatch",

	/**
	 * Proof type.
	 */
	ProofTypeMismatch: "proofTypeMismatch",

	/**
	 * Signature mismatch.
	 */
	SignatureMismatch: "signatureMismatch"
} as const;

/**
 * The failure reason of the proof.
 */
export type ImmutableProofFailure =
	(typeof ImmutableProofFailure)[keyof typeof ImmutableProofFailure];
