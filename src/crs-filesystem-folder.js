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
        this.setProperty("stackLength", 0);
    }

    async openFolder() {
        this.folder = await window.chooseFileSystemEntries({type: "open-directory"});
        const content = await this._getContent(this.folder);

        this.setProperty("folder", this.folder.name);
        this.setProperty("items", content);
        this.setProperty("folderOpen", true);
    }

    async _getContent(folder) {
        const entries = await folder.getEntries();
        const content = [];
        for await (const entry of entries) {
            content.push(this._createFileContent(entry));
        }
        return await this._sortContent(content);
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

    async dblClick(event) {
        const id = event.target.dataset.uid;
        if (id == null) return;

        const item = crsbinding.data.getValue(id);
        if (item.handle.isDirectory == true) {
            const content = await this._getContent(item.handle);
            this.setProperty("items", content);
        }
    }
}

customElements.define("crs-filesystem-folder", CRSFilesystemFolder);