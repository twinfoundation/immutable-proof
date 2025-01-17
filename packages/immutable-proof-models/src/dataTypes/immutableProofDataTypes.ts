// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { DataTypeHandlerFactory } from "@twin.org/data-core";
import type { JSONSchema7 } from "json-schema";
import { ImmutableProofTypes } from "../models/immutableProofTypes";
import ImmutableProofSchema from "../schemas/ImmutableProof.json";

/**
 * Handle all the data types for immutable proof.
 */
export class ImmutableProofDataTypes {
	/**
	 * Register all the data types.
	 */
	public static registerTypes(): void {
		DataTypeHandlerFactory.register(ImmutableProofTypes.ImmutableProof, () => ({
			type: ImmutableProofTypes.ImmutableProof,
			defaultValue: {},
			jsonSchema: async () => ImmutableProofSchema as JSONSchema7
		}));
	}
}
