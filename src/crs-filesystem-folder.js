// https://web.dev/native-file-system/#whats-new

export default class CRSFilesystemFolder extends crsbinding.classes.BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    constructor() {
        super();
        this.images = ["png", "jpg", "jpeg", "svg"];
    }

    dispose() {
        this.folder = null;
        super.dispose();
    }

    async openFolder() {
        this.folder = await window.chooseFileSystemEntries({type: "open-directory"});
        await this.refresh();

        this.setProperty("folderOpen", true);
    }

    async refresh() {
        const entries = await this.folder.getEntries();
        const content = [];

        for await (const entry of entries) {
            content.push(this._createFileContent(entry));
        }

        this.homeContent = await this._sortContent(content);
        this.setProperty("items", this.homeContent);
    }

    onMessage(msg) {
        if (this[msg.key]) {
            this[msg.key]();
        }
    }

    _createFileContent(entry) {
        const result = {
            handle: entry,
            name: entry.name,
            type: "#folder"
        };

        if (entry.isFile == true) {
            const parts = entry.name.split(".");
            result.name = parts[0];
            result.ext = parts[1].toLowerCase();
            result.type = this.images.indexOf(result.ext) == -1 ? "#file" : "#image";
        }

        return result;
    }

    _sortContent(collection) {
        const folders = collection.filter(item => item.handle.isDirectory == true).sort((a, b) => a.name < b.name ? -1 : 1);
        const files = collection.filter(item => item.handle.isFile == true).sort((a, b) => a.name < b.name ? -1 : 1);

        return [...folders, ...files];
    }
}

customElements.define("crs-filesystem-folder", CRSFilesystemFolder);