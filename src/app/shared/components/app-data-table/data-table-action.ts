export interface DataTableAction {
  handleEdit(rowObj: any, rowData: any);
  handleRun(rowObj: any, rowData: any);
  handleDownload(rowObj: any, rowData: any);
  handleEmail(rowObj: any, rowData: any);
  handleDelete(rowObj: any, rowData: any);
}
