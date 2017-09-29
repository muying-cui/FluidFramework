import * as api from "../api";
import { nativeTextAnalytics, resumeAnalytics, textAnalytics } from "../intelligence";
import { IntelligentServicesManager } from "./";
import { BaseWork} from "./baseWork";
import { IWork} from "./work";

export class IntelWork extends BaseWork implements IWork {

    constructor(docId: string, config: any) {
        super(docId, config);
    }

    public async start(): Promise<void> {
        await this.loadDocument({ localMinSeq: 0, encrypted: undefined });
        const root = await this.document.getRoot().getView();
        if (!root.has("insights")) {
            root.set("insights", this.document.createMap());
        }
        const insightsMap = root.get("insights") as api.IMap;
        const insightsMapView = await insightsMap.getView();
        return this.processIntelligenceWork(this.document, insightsMapView);
    }

    private processIntelligenceWork(doc: api.Document, insightsMap: api.IMapView): Promise<void> {
        const intelligenceManager = new IntelligentServicesManager(doc, insightsMap);
        intelligenceManager.registerService(resumeAnalytics.factory.create(this.config.intelligence.resume));
        intelligenceManager.registerService(textAnalytics.factory.create(this.config.intelligence.textAnalytics));
        if (this.config.intelligence.nativeTextAnalytics.enable) {
            intelligenceManager.registerService(
                nativeTextAnalytics.factory.create(this.config.intelligence.nativeTextAnalytics));
        }
        const eventHandler = (op: api.ISequencedDocumentMessage) => {
            if (op.type === api.ObjectOperation) {
                const objectId = op.contents.address;
                const object = doc.get(objectId);
                intelligenceManager.process(object);
            } else if (op.type === api.AttachObject) {
                const object = doc.get(op.contents.id);
                intelligenceManager.process(object);
            }
        };
        this.operation = eventHandler;
        this.document.on("op", eventHandler);
        return Promise.resolve();
    }
}
