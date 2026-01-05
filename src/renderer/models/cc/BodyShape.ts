export default class BodyShape {
	public id:string;
	public defaultActionId:string;
	public defaultMotionId:string;
	public defaultFaceId:string;

	constructor() {
		
	}

	public parse(xml:Element): void {
		this.id = xml.getAttribute("id");
		this.defaultActionId = xml.getAttribute("default_action") + ".xml";
		this.defaultMotionId = xml.getAttribute("default_motion") + ".xml";
		this.defaultFaceId = xml.getAttribute("facial_thumb");
		const children = xml.children;
		for (const i in children) {
			this.processNode(children[i]);
		}
	}

	public processNode(xml:Element): void {

	}

	public toString(): string {
		return this.id;
	}
};
