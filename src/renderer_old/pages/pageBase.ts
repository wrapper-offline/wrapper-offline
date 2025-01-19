export default abstract class PageBase {
	title: string;

	abstract render(parent:HTMLElement): void;
};
