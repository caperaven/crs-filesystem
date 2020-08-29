// https://web.dev/native-file-system/#whats-new

export default class CRSFilesystemFolder extends crsbinding.classes.BindableElement {
    get folderIcon() {
        return `#${this.getAttribute("folder-icon") || "folder"}`;
    }

    get fileIcon() {
        return `#${this.getAttribute("file-icon") || "file"}`;
    }

    get graphicIcon() {
        return `#${this.getAttribute("graphic-icon") || "image"}`;
    }

    get chevronIcon() {
        return `#${this.getAttribute("chevron-icon") || "chevron"}`;
    }


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

    preLoad() {
        this.setProperty("chevronIcon", this.chevronIcon);
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
            type: this.folderIcon
        };

        if (entry.isFile == true) {
            const parts = entry.name.split(".");
            result.name = parts[0];
            result.ext = parts[1].toLowerCase();
            result.type = this.images.indexOf(result.ext) == -1 ? this.fileIcon : this.graphicIcon;
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