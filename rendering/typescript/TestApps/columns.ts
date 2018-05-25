
const tableView = document.getElementById("table")!
const columns = new Columns(tableView)
columns.setColumns([
    { name: "Name", onSort: onSort },
    { name: "Erw.", onSort: onSort },
    { name: "Datum" },
    { name: "Größe", onSort: onSort },
    { name: "Version", onSort: onSort }
], "columns")

function onSort(ascending: boolean) {
    alert(ascending)
}
