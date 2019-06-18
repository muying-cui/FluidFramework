import { ISharedMap, SharedMap } from "@prague/map";
import { IComponentRuntime } from "@prague/runtime-definitions";
import { SharedString } from "@prague/sequence";

const rootMapId = "root";

/**
 * A document is a collection of collaborative types.
 */
export class Document {
    public static async load(runtime: IComponentRuntime): Promise<Document> {
        let root: ISharedMap;

        if (!runtime.existing) {
            root = SharedMap.create(runtime, rootMapId);
            root.attach();
        } else {
            root = await runtime.getChannel(rootMapId) as ISharedMap;
        }

        const document = new Document(runtime, root);

        return document;
    }

    /**
     * Flag indicating whether the document already existed at the time of load
     */
    public get existing(): boolean {
        return this.runtime.existing;
    }

    /**
     * Constructs a new document from the provided details
     */
    private constructor(public runtime: IComponentRuntime, private root: ISharedMap) {
    }

    public getRoot(): ISharedMap {
        return this.root;
    }

    public createMap(id?: string): ISharedMap {
        return SharedMap.create(this.runtime, id);
    }

    public createString(id?: string): SharedString {
        return SharedString.create(this.runtime, id);
    }
}
