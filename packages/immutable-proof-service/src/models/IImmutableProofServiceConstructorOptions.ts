// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IImmutableProofServiceConfig } from "./IImmutableProofServiceConfig";

/**
 * Options for the immutable proof service constructor.
 */
export interface IImmutableProofServiceConstructorOptions {
	/**
	 * The vault connector type.
	 * @default vault
	 */
	vaultConnectorType?: string;

	/**
	 * The entity storage for proofs.
	 * @default immutable-proof
	 */
	immutableProofEntityStorageType?: string;

	/**
	 * The immutable storage.
	 * @default immutable-storage
	 */
	immutableStorageType?: string;

	/**
	 * The identity connector type.
	 * @default identity
	 */
	identityConnectorType?: string;

	/**
	 * The background task connector type.
	 * @default background-task
	 */
	backgroundTaskConnectorType?: string;

	/**
	 * The event bus component type, defaults to no event bus.
	 */
	eventBusComponentType?: string;

	/**
	 * The configuration for the connector.
	 */
	config?: IImmutableProofServiceConfig;
}
