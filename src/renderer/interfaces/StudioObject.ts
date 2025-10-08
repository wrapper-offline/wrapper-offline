/**
 * video editor object
 */
export default interface StudioObject extends HTMLObjectElement {
	/**
	 * adds a ugc asset to the scene
	 * @param assetType asset type
	 * @param assetId asset id
	 */
	importerAddAsset(assetType: string, assetId: string): void;

	/**
	 * changes the importer icon state
	 * @param status icon to display
	 */
	importerStatus(status: "clear" | "done" | "processing"): void;

	/**
	 * adds an asset to your library
	 * @param assetType asset type
	 * @param assetId asset id
	 * @param assetData asset data
	 */
	importerUploadComplete(
		assetType: string,
		assetId: string,
		assetData: Record<string, string> | {
			/** id */
			file: string,
			/** id again */
			enc_asset_id: string,
			/** user-specified title */
			title: string,
			/** tags separated by comma*/
			tags: string
		}
	): void;

	/**
	 * adds a character to the thumbtray
	 * @param assetId character id
	 */
	loadCharacterById(assetId: string): void;

	/**
	 * opens publish window, only listened for when preview is open
	 */
	onExternalPreviewPlayerPublish(): void
};
