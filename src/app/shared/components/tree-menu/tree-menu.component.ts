import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-tree-menu',
  templateUrl: './tree-menu.component.html',
  styleUrls: ['./tree-menu.component.scss']
})
export class TreeMenuComponent implements OnInit {
  private options = { isExpandedField: 'expanded' };
  @Input() nodes: any;
  @Output() fetchContracts:
  EventEmitter<{ templateId: string, actionName: string, recordsToDisplay: number, pageNum: number }> = new EventEmitter<{ templateId: string, actionName: string, recordsToDisplay: number, pageNum: number }>();
  ngOnInit() {
  }
  onTreeLoad(tree): void {
    // uncomment following line for expand all tree nodes
    // tree.treeModel.expandAll();
    tree.treeModel.getVisibleRoots()[0].getVisibleChildren()[0].focus();
    if (this.nodes.length && this.nodes[0].children.length) {
      const obj: any = {};
      obj.target = {};
      obj.target.id = this.nodes[0].children[0].id;
      this.onEvent(obj);
    }
  }
  onEvent(e) {
    const retObj: any = {
      templateId: e.target.id.split('_')[0],
      actionName: e.target.id.split('_')[1],
      recordsToDisplay: 20,
      pageNum: 1
    };
    this.fetchContracts.emit(retObj);
  }
}
