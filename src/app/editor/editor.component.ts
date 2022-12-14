import { Component, ElementRef, AfterViewInit, OnInit } from '@angular/core';

import cytoscape = require('cytoscape');
import { saveAs } from 'file-saver';
import { MatDialog } from '@angular/material';
import { ExampleDialogComponent } from '../example-dialog/example-dialog.component';
import Mousetrap = require('mousetrap');

export interface Skills {
  name: string;
  id: string;
  gap: number;
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit, AfterViewInit {
  constructor(public dialog: MatDialog, private elementRef: ElementRef) {}

  ngAfterViewInit() {
    const mousetrap1 = new Mousetrap();
    mousetrap1.bind('R', () => {
      this.openDialog('addroot');
    });
    mousetrap1.bind('C', () => {
      this.openDialog('addchild');
    });
    mousetrap1.bind('D', () => {
      this.removeNode();
    });
    mousetrap1.bind('A', () => {
      this.adjustweight(1);
    });
    mousetrap1.bind('T', () => {
      this.adjustweight(-1);
    });
    mousetrap1.bind('L', () => {
      this.onFileSelected();
    });
    mousetrap1.bind('S', () => {
      this.save();
    });
  }

  openDialog(op: string): void {
    var names = this.cy.nodes().map(function (ele) {
      return ele.data('name').trim().toLowerCase();
    });

    let dialogRef = this.dialog.open(ExampleDialogComponent, {
      data: { operation: op, names: names },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.updateFromChoice(JSON.stringify({ operation: op, choice: result }));
    });
  }

  updateFromChoice(data) {
    const j = JSON.parse(data);
    if (!j.choice || j.choice.trim().length == 0) return;
    var choice = j.choice.trim();
    if (j.operation == 'rename') this.rename(choice);
    else if (j.operation == 'addroot') this.addchild(false, choice);
    else if (j.operation == 'addchild') this.addchild(true, choice);
  }

  cy: cytoscape.Core;
  selectedId: string = '';
  scratchPad: string = '';
  numMatches: number = 0;
  searching: boolean = false;
  fuzzySearching: boolean = false;
  highlight: boolean = false;
  canRemoveNode: boolean = false;

  dataSource = [{ name: 'not', id: 'set', gap: 1.0079 }];
  displayedColumns: string[] = ['name', 'gap'];

  mystyle = [
    {
      selector: 'node',
      style: {
        'text-valign': 'top',
        label: 'data(name)',
        width: (ele) => {
          if (this.highlight) {
            if (ele.data('level') == 0) return 60;
            if (ele.data('level') == 1) return 40;
            return 1;
          }
          return 30;
        },
        height: (ele) => {
          if (this.highlight) {
            if (ele.data('level') == 0) return 60;
            if (ele.data('level') == 1) return 40;
            return 1;
          }
          return 30;
        },
        'font-size': (ele) => {
          if (this.highlight) {
            if (ele.data('level') == 0) return 60;
            if (ele.data('level') == 1) return 40;
            return 1;
          }
          var min = 15,
            max = 60,
            l = 0,
            r = 60;
          return min + ((ele.data('gap') - l) / (r - l)) * (max - min);
        },
        'background-color': (ele) => {
          return this.colorIt(ele);
        },

        color: (ele) => {
          return this.colorIt(ele);
        },
      },
    },
    {
      selector: 'edge',
      style: {
        'line-color': 'gray',
        width: '0.5',
      },
    },
  ];

  unselect() {
    this.scratchPad = '';
    this.selectedId = '';
    this.search();
  }

  setHighlight(b: boolean, exitedbutton: boolean) {
    if (exitedbutton) {
      if (this.highlight) {
        this.cy.fit(this.cy.elements());
        this.highlight = b;
        this.redraw();
      }
    } else {
      this.unselect();
      this.cy.fit(this.cy.nodes());
      this.highlight = b;
      this.redraw();
    }
  }
  colorIt(ele) {
    if (ele.selected()) return 'red';
    else if (ele.data('level') == 0) return '#82E0AA';
    else if (ele.data('level') == 1) return '#28B463';
    return '#186A3B';
  }

  ngOnInit() {
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      elements: this.graph,
      style: this.mystyle,
      layout: {
        name: 'cose',
        fit: true,
        spacingFactor: 1,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,
      },
      boxSelectionEnabled: true,
    });

    this.cy.minZoom(0.2);
    this.cy.maxZoom(1);
    this.updateTable();
  }

  updateTable() {
    this.dataSource = new Array();
    this.cy
      .elements('node')
      .sort(function (a, b) {
        return b.data('gap') - a.data('gap');
      })
      .slice(0, 20)
      .forEach((elem) => {
        this.dataSource.push({
          name: elem.data('name'),
          id: elem.data('id'),
          gap: elem.data('gap'),
        });
        console.log(elem.data('name') + ' ' + elem.data('gap'));
      });
  }

  setCanRemoveNode() {
    this.canRemoveNode =
      this.cy.$('node:selected').length == 1 &&
      this.cy.$('node:selected').degree(false) <= 1;
    console.log('canRemoveNode' + this.canRemoveNode);
  }

  removeNode() {
    if (
      this.numMatches == 1 &&
      this.cy.filter("[name='" + this.scratchPad + "']").degree(false) <= 1
    )
      this.cy.remove('[name ="' + this.scratchPad + '"]');
    this.unselect();
  }

  adjustweight(delta) {
    const sp = this.scratchPad;
    this.cy.$('node:selected').forEach((element) => {
      element.data('gap', element.data('gap') + delta);
    });
    this.updateTable();
  }

  adjustFromId(id, delta) {
    this.unselect();
    this.cy.filter('true').unselect();
    this.cy.filter("[id='" + id + "']").select();
    this.adjustweight(delta);
    this.scratchPad = this.cy.filter("[id='" + id + "']").data('name');
    this.search();
  }

  search() {
    const sp = this.scratchPad;
    this.cy.nodes().unselect();
    this.cy
      .nodes()
      .filter(function (element, i) {
        return (
          sp.length > 0 &&
          element.data('name').toLowerCase() == sp.toLowerCase()
        );
      })
      .select();
    this.numMatches = this.cy.elements(':selected').length;
    this.searching = this.numMatches > 0;
    this.fuzzySearching = false;
    this.redraw();
  }

  fuzzySearch() {
    const sp = this.scratchPad;
    this.cy.nodes().unselect();
    this.cy
      .nodes()
      .filter(function (element, i) {
        return (
          sp.length > 0 &&
          element.data('name').toLowerCase().includes(sp.toLowerCase())
        );
      })
      .select();
    this.numMatches = this.cy.elements(':selected').length;
    this.searching = false;
    this.fuzzySearching = this.numMatches > 0;
    this.redraw();
  }

  redraw() {
    this.cy.json({ style: this.mystyle });

    this.cy.fit(this.cy.elements(':selected'));
  }

  rename(choice: string) {
    if (this.numMatches != 1) return;
    let n = this.cy
      .nodes()
      .filter("[id='" + this.selectedId + "']")
      .first();
    n.data('name', choice);
    this.updateTable();
  }

  generateUniqSerial(): string {
    return 'xxxx-xxxx-xxx-xxxx'.replace(/[x]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      return r.toString(16);
    });
  }

  save() {
    const blob = new Blob([JSON.stringify(this.cy.json())], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, 'save-me.txt');
  }
  fileContent: string = '';

  onFileSelected() {
    const inputNode: any = document.querySelector('#file');
    console.log('InputNode' + inputNode.files[0]);
    if (!inputNode.files[0]) return;
    var file = inputNode.files[0];
    let fileReader: FileReader = new FileReader();
    let self = this;
    fileReader.onloadend = function (x) {
      self.cy.elements().remove();
      self.cy.json(JSON.parse('' + fileReader.result));
      self.redraw();
      self.updateTable();
    };
    fileReader.readAsText(file);
  }

  dialogChanging() {
    console.log('Dialog changing');
  }

  addchild(hasparent: boolean, choice: string) {
    if (hasparent && this.numMatches != 1) return;
    if (
      this.cy
        .filter(function (element, i) {
          return element.data('name').toLowerCase() == choice.toLowerCase();
        })
        .size() > 0
    ) {
      console.log('Node with name ' + choice + 'already exists');
      this.scratchPad = choice;
      this.search();
      this.cy.fit();
      return;
    }

    var x = 100;
    var y = 100;
    if (hasparent) {
      x = this.cy.nodes(':selected').first().position('x');
      y = this.cy.nodes(':selected').first().position('y');
    }

    var newid = this.generateUniqSerial();
    var newLevel = 2;
    if (!hasparent) newLevel = 0;
    this.cy.add([
      {
        group: 'nodes',
        data: {
          type: 'node',
          name: choice,
          id: newid,
          gap: 1,
          desc: '',
          level: newLevel,
        },
        position: { x: x + 20, y: y + 20 },
      },
    ]);
    if (hasparent)
      this.cy.add([
        {
          group: 'edges',
          data: {
            id: newid + '0',
            name: 'edge' + newid,
            source: this.selectedId,
            target: newid,
          },
        },
      ]);
    x += 20;
    y += 20;
    this.selectedId = newid;
    this.scratchPad = choice;
    this.search();
    this.cy.fit();
    this.redraw();
  }

  evtListener() {
    var timeout;
    var t = this;
    this.cy.on('select', 'node', function (event) {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        //window['selectedNodes'] = this.cy.$('node:selected');
        t.setCanRemoveNode();
      }, 100); // may have to adjust this val
    });

    this.cy.on('tap', (event) => {
      this.unselect();
      var evtTarget = event.target;
      if (evtTarget && evtTarget.isNode && evtTarget.isNode()) {
        this.scratchPad = evtTarget.data('name');
        this.selectedId = evtTarget.data('id');
        this.numMatches = 1;
      } else if (evtTarget && evtTarget.isEdge && evtTarget.isEdge()) {
        console.log('this is an edge');
      }
    });
  }

  public graph: any = {
    nodes: [
      {
        data: {
          type: 'node',
          id: '3',
          name: 'IT Ops',
          gap: 1,
          desc: '',
          level: 0,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '4',
          name: 'Security ',
          gap: 1,
          desc: '',
          level: 0,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '5',
          name: 'Software Dev',
          gap: 1,
          desc: '',
          level: 0,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '6',
          name: 'Big Data',
          gap: 1,
          desc: '',
          level: 0,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '7',
          name: 'Business Intelligence',
          gap: 1,
          desc: '',
          level: 0,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '8',
          name: 'Security Certifications',
          gap: 1,
          desc: '',
          level: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '9',
          name: 'Cloud Arch. And Design',
          gap: 1,
          desc: '',
          level: 0,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '10',
          name: 'Cloud Platforms',
          gap: 1,
          desc: '',
          level: 0,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '11',
          name: 'Configuration Management',
          gap: 1,
          desc: '',
          level: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '12',
          name: 'Containers',
          gap: 1,
          desc: '',
          level: 0,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '13',
          name: 'Data Visualization',
          gap: 1,
          desc: '',
          level: 0,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '14',
          name: 'Databases',
          gap: 1,
          desc: '',
          level: 0,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '16',
          name: 'DevOps',
          gap: 1,
          desc: '',
          level: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '17',
          name: 'IT Automation',
          gap: 1,
          desc: '',
          level: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '18',
          name: 'Languages and Libs',
          gap: 1,
          desc: '',
          level: 0,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '19',
          name: 'Machine Learning',
          gap: 1,
          desc: '',
          level: 0,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '20',
          name: 'Mob Dev',
          gap: 1,
          desc: '',
          level: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '21',
          name: 'Programming Languages',
          gap: 1,
          desc: '',
          level: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '22',
          name: 'Security Arch. And Engineering',
          gap: 1,
          desc: '',
          level: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '23',
          name: 'Security Awareness',
          gap: 1,
          desc: '',
          level: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '24',
          name: 'Security Operations',
          gap: 1,
          desc: '',
          level: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '25',
          name: 'Security Testing',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '26',
          name: 'Social',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '27',
          name: 'Testing',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '28',
          name: 'Virtualization',
          gap: 1,
          desc: '',
          level: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '29',
          name: 'Web Dev',
          gap: 1,
          desc: '',
          level: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '30',
          name: 'Alteryx',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '32',
          name: 'Amazon Data Pipeline',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '33',
          name: 'Amazon DynamoDB',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '35',
          name: 'Amazon Elastic Container Service (ECS)',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '36',
          name: 'Amazon ElastiCache',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '38',
          name: 'Amazon Web Services (AWS)',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '39',
          name: 'Android',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '40',
          name: 'Angular',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '41',
          name: 'Apache Cassandra',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '42',
          name: 'Apache Kafka',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '43',
          name: 'Apache Spark',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '44',
          name: 'Artificial Intelligence (AI)',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '45',
          name: 'ASP.NET Core',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '46',
          name: 'AWS Certified Solutions Arch. - Associate SAA-C02',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '47',
          name: 'AWS Certified Solutions Arch. - Professional SAP-C01',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '48',
          name: 'Azure Automation',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '49',
          name: 'Azure Automation DSC',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '50',
          name: 'Azure Cosmos DB',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '51',
          name: 'Azure HDInsight',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '52',
          name: 'Azure K8s Service (AKS)',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '53',
          name: 'Azure Machine Learning',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '54',
          name: 'Azure Red Hat OpenShift',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '55',
          name: 'Azure SQL',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '57',
          name: 'Azure SQL Data Warehouse',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '59',
          name: 'Azure Web App for Containers',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '60',
          name: 'Bash',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '61',
          name: 'BeautifulSoup',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '62',
          name: 'Big Data Principles',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '63',
          name: 'C#',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '64',
          name: 'C++',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '65',
          name: 'Caching',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '66',
          name: 'CCSP',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '67',
          name: 'CEH',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '68',
          name: 'Certified Chef Developer',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '69',
          name: 'Certified K8s Administrator',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '70',
          name: 'Chef',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '71',
          name: 'CISA',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '72',
          name: 'CISM',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '73',
          name: 'CISSP',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '74',
          name: 'Citrix CCA-V',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '75',
          name: 'Citrix CCP-V',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '76',
          name: 'Cloudera Distribution Hadoop (CDH)',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '77',
          name: 'CompTIA Security+',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '78',
          name: 'Continuous Monitoring and Detection',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '79',
          name: 'CSS',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '80',
          name: 'CySA+',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '81',
          name: 'D3',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '82',
          name: 'Data Security',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '83',
          name: 'Deep Learning',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '84',
          name: 'Digital Communications',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '85',
          name: 'Digital Forensics',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '86',
          name: 'Docker',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '87',
          name: 'Docker Swarm',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '88',
          name: 'Enterprise Security Infrastructure',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '89',
          name: 'Facebook Integration',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '90',
          name: 'Feature Engineering',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '91',
          name: 'Flutter',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '92',
          name: 'General Business Intelligence Principles',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '93',
          name: 'ggplot2',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '94',
          name: 'Go',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '95',
          name: 'Google Charts',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '96',
          name: 'Google Cloud Platform',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '97',
          name: 'Google Cloud Spanner',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '98',
          name: 'Google Container Registry',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '99',
          name: 'Google K8s Engine',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '100',
          name: 'Google Professional Cloud Arch.',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '101',
          name: 'Group Policy',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '102',
          name: 'Hadoop',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '103',
          name: 'Heroku',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '104',
          name: 'HTML',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '105',
          name: 'Hyperspace',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '106',
          name: 'Incident Response',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '107',
          name: 'iOS',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '108',
          name: 'Istio',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '109',
          name: 'Java',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '110',
          name: 'JavaScript',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '112',
          name: 'Jenkins',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '113',
          name: 'Jupyter',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '114',
          name: 'Karate',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '115',
          name: 'Keras',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '116',
          name: 'Kotlin',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '118',
          name: 'K8s',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '119',
          name: 'Machine Learning Literacy',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '120',
          name: 'Malware Analysis',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '121',
          name: 'MapReduce',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '122',
          name: 'MariaDB',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '123',
          name: 'matplotlib',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '124',
          name: 'Azure',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '125',
          name: 'Azure Arch. Design AZ-301',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '126',
          name: 'Azure Arch. Design AZ-304',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '127',
          name: 'Azure Arch. Tech AZ-300',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '128',
          name: 'Azure Arch. Tech AZ-303',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '129',
          name: 'Azure Arch. Fundamentals',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '130',
          name: 'Azure Blob Storage',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '131',
          name: 'Azure Data Lake',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '132',
          name: 'Azure DevOps',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '133',
          name: 'Microsoft Desired State Configuration (DSC)',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '134',
          name: 'Microsoft Excel',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '135',
          name: 'Microsoft Hyper-V',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '136',
          name: 'Microsoft Intune',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '137',
          name: 'Microsoft Orca',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '138',
          name: 'Microsoft Power Automate',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '139',
          name: 'Microsoft Power BI',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '140',
          name: 'Microsoft SQL Server',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '142',
          name: 'Microsoft StreamInsight',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '143',
          name: 'Mob Device Security',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '144',
          name: 'MySQL',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '146',
          name: 'Neural Networks (NNs)',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '147',
          name: 'Node.js',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '148',
          name: 'NuGet',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '149',
          name: 'NumPy',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '150',
          name: 'OpenStack',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '151',
          name: 'Oracle Business Intelligence',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '152',
          name: 'Oracle Cloud Platform',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '153',
          name: 'pandas',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '154',
          name: 'Penetration Testing',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '155',
          name: 'PenTest+',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '156',
          name: 'Personally Identifiable Information (PII)',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '157',
          name: 'PHP',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '158',
          name: 'PostgreSQL',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '160',
          name: 'PowerShell',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '161',
          name: 'PowerShell Core',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '162',
          name: 'Predictive Analytics',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '163',
          name: 'Puppet',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '164',
          name: 'Puppet Bolt',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '165',
          name: 'pygal',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '166',
          name: 'Python',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '170',
          name: 'PyTorch',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '171',
          name: 'Qlik Sense',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '172',
          name: 'R',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '175',
          name: 'React',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '176',
          name: 'React Native',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '177',
          name: 'Red Hat Cert System Admin',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '178',
          name: 'Red Teaming',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '179',
          name: 'Rust',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '180',
          name: 'Salt',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '181',
          name: 'SauceLabs',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '182',
          name: 'scikit-image',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '183',
          name: 'scikit-learn',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '184',
          name: 'Scrapy',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '185',
          name: 'Security Operations Engineering',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '186',
          name: 'Social Networking and Engineering',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '187',
          name: 'Splunk',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '188',
          name: 'Spring Cloud',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '189',
          name: 'SpringBoot',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '190',
          name: 'SQL',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '191',
          name: 'SQL Server Reporting Services',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '192',
          name: 'SQLite',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '194',
          name: 'SSAS',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '195',
          name: 'SSIS',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '196',
          name: 'Swift',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '198',
          name: 'System Center Configuration Manager',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '199',
          name: 'Tableau',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '200',
          name: 'Tensorflow',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '201',
          name: 'Terraform',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '202',
          name: 'Threat Hunting',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '203',
          name: 'Threat Intelligence',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '204',
          name: 'TypeScript',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '206',
          name: 'Vagrant',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '207',
          name: 'Visualization Principles',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '208',
          name: 'VMware Certified Associate',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '209',
          name: 'VMware Cloud',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '210',
          name: 'VMware Fusion',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '211',
          name: 'VMware Horizon',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '212',
          name: 'VMware User Environment Manager',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '213',
          name: 'VMware vCloud',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '214',
          name: 'Vulnerability Assessment',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: '215',
          name: 'Xamarin',
          gap: 1,
          desc: '',
        },
        group: 'nodes',
      },
    ],
    edges: [
      {
        data: {
          id: '1000000',
          name: 'Security-Certifications',
          source: '4',
          target: '8',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000001',
          name: 'IT-OpsConfiguration-Management',
          source: '3',
          target: '11',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000002',
          name: 'IT-OpsIT-Automation',
          source: '3',
          target: '17',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000003',
          name: 'IT-OpsVirtualization',
          source: '3',
          target: '28',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000004',
          name: 'Security-Security-Arch.-And-Engineering',
          source: '4',
          target: '22',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000005',
          name: 'Security-Security-Operations',
          source: '4',
          target: '24',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000006',
          name: 'Security-Security-Testing',
          source: '4',
          target: '25',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000007',
          name: 'Security-Security-Awareness',
          source: '4',
          target: '23',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000008',
          name: 'Software-DevelopmentMobile-Dev',
          source: '5',
          target: '20',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000009',
          name: 'Software-DevelopmentProgramming-Languages',
          source: '5',
          target: '21',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000010',
          name: 'Software-DevelopmentWeb-Dev',
          source: '5',
          target: '29',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000011',
          name: 'Software-DevelopmentDevOps',
          source: '5',
          target: '16',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000012',
          name: 'Software-DevelopmentTesting',
          source: '5',
          target: '27',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000013',
          name: 'Software-DevelopmentSocial',
          source: '5',
          target: '26',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000014',
          name: 'Cloud-Arch.-And-DesignAWS-Certified-Solutions-Arch.---Associate-SAA-C02',
          source: '9',
          target: '46',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000015',
          name: 'Cloud-Arch.-And-DesignAWS-Certified-Solutions-Arch.---Professional-SAP-C01',
          source: '9',
          target: '47',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000016',
          name: 'Cloud-Arch.-And-DesignGoogle-Professional-Cloud-Arch.',
          source: '9',
          target: '100',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000017',
          name: 'Cloud-Arch.-And-DesignMicrosoft-Azure-Arch.-Design-AZ-301',
          source: '9',
          target: '125',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000018',
          name: 'Cloud-Arch.-And-DesignMicrosoft-Azure-Arch.-Design-AZ-304',
          source: '9',
          target: '126',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000019',
          name: 'Cloud-Arch.-And-DesignMicrosoft-Azure-Arch.-Tech-AZ-300',
          source: '9',
          target: '127',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000020',
          name: 'Cloud-Arch.-And-DesignMicrosoft-Azure-Arch.-Tech-AZ-303',
          source: '9',
          target: '128',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000021',
          name: 'Cloud-Arch.-And-DesignMicrosoft-Azure-Arch.-Fundamentals',
          source: '9',
          target: '129',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000022',
          name: 'Cloud-PlatformsAmazon-Web-Services-(AWS)',
          source: '10',
          target: '38',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000023',
          name: 'Cloud-PlatformsGoogle-Cloud-Platform',
          source: '10',
          target: '96',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000024',
          name: 'Cloud-PlatformsHeroku',
          source: '10',
          target: '103',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000025',
          name: 'Cloud-PlatformsMicrosoft-Azure',
          source: '10',
          target: '124',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000026',
          name: 'Cloud-PlatformsMicrosoft-Azure-Blob-Storage',
          source: '10',
          target: '130',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000027',
          name: 'Cloud-PlatformsMicrosoft-Azure-Data-Lake',
          source: '10',
          target: '131',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000028',
          name: 'Cloud-PlatformsMicrosoft-Azure-DevOps',
          source: '10',
          target: '132',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000029',
          name: 'Cloud-PlatformsOracle-Cloud-Platform',
          source: '10',
          target: '152',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000030',
          name: 'Cloud-PlatformsSpring-Cloud',
          source: '10',
          target: '188',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000031',
          name: 'Cloud-PlatformsVMware-Cloud',
          source: '10',
          target: '209',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000032',
          name: 'Big-DataAmazon-Data-Pipeline',
          source: '6',
          target: '32',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000033',
          name: 'Big-DataApache-Cassandra',
          source: '6',
          target: '41',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000034',
          name: 'Big-DataApache-Kafka',
          source: '6',
          target: '42',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000035',
          name: 'Big-DataAzure-HDInsight',
          source: '6',
          target: '51',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000036',
          name: 'Big-DataBig-Data-Principles',
          source: '6',
          target: '62',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000037',
          name: 'Big-DataCloudera-Distribution-Hadoop-(CDH)',
          source: '6',
          target: '76',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000038',
          name: 'Big-DataHadoop',
          source: '6',
          target: '102',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000039',
          name: 'Big-DataMapReduce',
          source: '6',
          target: '121',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000040',
          name: 'Big-DataMicrosoft-StreamInsight',
          source: '6',
          target: '142',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000041',
          name: 'Big-DataSplunk',
          source: '6',
          target: '187',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000042',
          name: 'Business-IntelligenceAlteryx',
          source: '7',
          target: '30',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000043',
          name: 'Business-IntelligenceGeneral-Business-Intelligence-Principles',
          source: '7',
          target: '92',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000044',
          name: 'Business-IntelligenceMicrosoft-Excel',
          source: '7',
          target: '134',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000045',
          name: 'Business-IntelligenceMicrosoft-Power-BI',
          source: '7',
          target: '139',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000046',
          name: 'Business-IntelligenceOracle-Business-Intelligence',
          source: '7',
          target: '151',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000047',
          name: 'Business-IntelligencePredictive-Analytics',
          source: '7',
          target: '162',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000048',
          name: 'Business-IntelligenceSQL-Server-Reporting-Services',
          source: '7',
          target: '191',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000049',
          name: 'Business-IntelligenceSSAS',
          source: '7',
          target: '194',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000050',
          name: 'Business-IntelligenceSSIS',
          source: '7',
          target: '195',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000051',
          name: 'Business-IntelligenceTableau',
          source: '7',
          target: '199',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000052',
          name: 'Data-VisualizationAlteryx',
          source: '13',
          target: '30',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000053',
          name: 'Data-VisualizationD3',
          source: '13',
          target: '81',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000054',
          name: 'Data-Visualizationggplot2',
          source: '13',
          target: '93',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000055',
          name: 'Data-VisualizationGoogle-Charts',
          source: '13',
          target: '95',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000056',
          name: 'Data-VisualizationJupyter',
          source: '13',
          target: '113',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000057',
          name: 'Data-Visualizationmatplotlib',
          source: '13',
          target: '123',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000058',
          name: 'Data-Visualizationpygal',
          source: '13',
          target: '165',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000059',
          name: 'Data-VisualizationQlik-Sense',
          source: '13',
          target: '171',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000060',
          name: 'Data-VisualizationR',
          source: '13',
          target: '172',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000061',
          name: 'Data-VisualizationVisualization-Principles',
          source: '13',
          target: '207',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000062',
          name: 'DatabasesAmazon-DynamoDB',
          source: '14',
          target: '33',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000063',
          name: 'DatabasesAmazon-ElastiCache',
          source: '14',
          target: '36',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000064',
          name: 'DatabasesAzure-SQL',
          source: '14',
          target: '55',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000065',
          name: 'DatabasesAzure-SQL-Data-Warehouse',
          source: '14',
          target: '57',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000066',
          name: 'DatabasesCaching',
          source: '14',
          target: '65',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000067',
          name: 'DatabasesGoogle-Cloud-Spanner',
          source: '14',
          target: '97',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000068',
          name: 'DatabasesMicrosoft-SQL-Server',
          source: '14',
          target: '140',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000069',
          name: 'DatabasesMySQL',
          source: '14',
          target: '144',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000070',
          name: 'DatabasesPostgreSQL',
          source: '14',
          target: '158',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000071',
          name: 'DatabasesSQLite',
          source: '14',
          target: '192',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000072',
          name: 'Languages-and-LibrariesApache-Spark',
          source: '18',
          target: '43',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000073',
          name: 'Languages-and-LibrariesBeautifulSoup',
          source: '18',
          target: '61',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000074',
          name: 'Languages-and-LibrariesKeras',
          source: '18',
          target: '115',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000075',
          name: 'Languages-and-LibrariesNumPy',
          source: '18',
          target: '149',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000076',
          name: 'Languages-and-Librariespandas',
          source: '18',
          target: '153',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000077',
          name: 'Languages-and-LibrariesR',
          source: '18',
          target: '172',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000078',
          name: 'Languages-and-Librariesscikit-image',
          source: '18',
          target: '182',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000079',
          name: 'Languages-and-LibrariesSpringBoot',
          source: '18',
          target: '189',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000080',
          name: 'Languages-and-Librariesscikit-learn',
          source: '18',
          target: '183',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000081',
          name: 'Languages-and-LibrariesScrapy',
          source: '18',
          target: '184',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000082',
          name: 'Machine-LearningArtificial-Intelligence-(AI)',
          source: '19',
          target: '44',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000083',
          name: 'Machine-LearningAzure-Machine-Learning',
          source: '19',
          target: '53',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000084',
          name: 'Machine-LearningDeep-Learning',
          source: '19',
          target: '83',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000085',
          name: 'Machine-LearningFeature-Engineering',
          source: '19',
          target: '90',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000086',
          name: 'Machine-LearningMachine-Learning-Literacy',
          source: '19',
          target: '119',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000087',
          name: 'Machine-LearningNeural-Networks-(NNs)',
          source: '19',
          target: '146',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000088',
          name: 'Machine-LearningPyTorch',
          source: '19',
          target: '170',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000089',
          name: 'Machine-LearningR',
          source: '19',
          target: '172',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000090',
          name: 'Machine-LearningTensorflow',
          source: '19',
          target: '200',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000091',
          name: 'Configuration-ManagementCertified-Chef-Developer',
          source: '11',
          target: '68',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000092',
          name: 'Configuration-ManagementChef',
          source: '11',
          target: '70',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000093',
          name: 'Configuration-ManagementGroup-Policy',
          source: '11',
          target: '101',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000094',
          name: 'Configuration-ManagementMicrosoft-Desired-State-Configuration-(DSC)',
          source: '11',
          target: '133',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000095',
          name: 'Configuration-ManagementMicrosoft-Intune',
          source: '11',
          target: '136',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000096',
          name: 'Configuration-ManagementPuppet',
          source: '11',
          target: '163',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000097',
          name: 'Configuration-ManagementPuppet-Bolt',
          source: '11',
          target: '164',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000098',
          name: 'Configuration-ManagementSalt',
          source: '11',
          target: '180',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000099',
          name: 'Configuration-ManagementSystem-Center-Configuration-Manager',
          source: '11',
          target: '198',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000100',
          name: 'Configuration-ManagementVagrant',
          source: '11',
          target: '206',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000101',
          name: 'ContainersAmazon-Elastic-Container-Service-(ECS)',
          source: '12',
          target: '35',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000102',
          name: 'ContainersAzure-K8s-Service-(AKS)',
          source: '12',
          target: '52',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000103',
          name: 'ContainersAzure-Red-Hat-OpenShift',
          source: '12',
          target: '54',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000104',
          name: 'ContainersAzure-Web-App-for-Containers',
          source: '12',
          target: '59',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000105',
          name: 'ContainersCertified-K8s-Administrator',
          source: '12',
          target: '69',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000106',
          name: 'ContainersDocker',
          source: '12',
          target: '86',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000107',
          name: 'ContainersIstio',
          source: '12',
          target: '108',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000108',
          name: 'ContainersDocker-Swarm',
          source: '12',
          target: '87',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000109',
          name: 'ContainersGoogle-Container-Registry',
          source: '12',
          target: '98',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000110',
          name: 'ContainersGoogle-K8s-Engine',
          source: '12',
          target: '99',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000111',
          name: 'ContainersKubernetes',
          source: '12',
          target: '118',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000112',
          name: 'IT-AutomationAzure-Automation',
          source: '17',
          target: '48',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000113',
          name: 'IT-AutomationAzure-Automation-DSC',
          source: '17',
          target: '49',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000114',
          name: 'IT-AutomationBash',
          source: '17',
          target: '60',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000115',
          name: 'IT-AutomationMicrosoft-Orca',
          source: '17',
          target: '137',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000116',
          name: 'IT-AutomationMicrosoft-Power-Automate',
          source: '17',
          target: '138',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000117',
          name: 'IT-AutomationNuGet',
          source: '17',
          target: '148',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000118',
          name: 'IT-AutomationPowerShell',
          source: '17',
          target: '160',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000119',
          name: 'IT-AutomationPowerShell-Core',
          source: '17',
          target: '161',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000120',
          name: 'VirtualizationCitrix-CCA-V',
          source: '28',
          target: '74',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000121',
          name: 'VirtualizationCitrix-CCP-V',
          source: '28',
          target: '75',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000122',
          name: 'VirtualizationMicrosoft-Hyper-V',
          source: '28',
          target: '135',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000123',
          name: 'VirtualizationOpenStack',
          source: '28',
          target: '150',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000124',
          name: 'VirtualizationRed-Hat-Certified-System-Administrator-in-Red-Hat-Openstack',
          source: '28',
          target: '177',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000125',
          name: 'VirtualizationVMware-Certified-Associate',
          source: '28',
          target: '208',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000126',
          name: 'VirtualizationVMware-Fusion',
          source: '28',
          target: '210',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000127',
          name: 'VirtualizationVMware-Horizon',
          source: '28',
          target: '211',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000128',
          name: 'VirtualizationVMware-User-Environment-Manager',
          source: '28',
          target: '212',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000129',
          name: 'VirtualizationVMware-vCloud',
          source: '28',
          target: '213',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000130',
          name: 'CertificationsCCSP',
          source: '8',
          target: '66',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000131',
          name: 'CertificationsCEH',
          source: '8',
          target: '67',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000132',
          name: 'CertificationsCISA',
          source: '8',
          target: '71',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000133',
          name: 'CertificationsCISM',
          source: '8',
          target: '72',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000134',
          name: 'CertificationsCISSP',
          source: '8',
          target: '73',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000135',
          name: 'CertificationsCompTIA-Security+',
          source: '8',
          target: '77',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000136',
          name: 'CertificationsCySA+',
          source: '8',
          target: '80',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000137',
          name: 'CertificationsPenTest+',
          source: '8',
          target: '155',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000138',
          name: 'Security-Arch.-And-EngineeringEnterprise-Security-Infrastructure',
          source: '22',
          target: '88',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000139',
          name: 'Security-Arch.-And-EngineeringSecurity-Operations-Engineering',
          source: '22',
          target: '185',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000140',
          name: 'Security-OperationsContinuous-Monitoring-and-Detection',
          source: '24',
          target: '78',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000141',
          name: 'Security-OperationsIncident-Response',
          source: '24',
          target: '106',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000142',
          name: 'Security-OperationsDigital-Forensics',
          source: '24',
          target: '85',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000143',
          name: 'Security-OperationsMalware-Analysis',
          source: '24',
          target: '120',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000144',
          name: 'Security-OperationsThreat-Hunting',
          source: '24',
          target: '202',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000145',
          name: 'Security-OperationsThreat-Intelligence',
          source: '24',
          target: '203',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000146',
          name: 'Security-OperationsRed-Teaming',
          source: '24',
          target: '178',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000147',
          name: 'Security-TestingPenetration-Testing',
          source: '25',
          target: '154',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000148',
          name: 'Security-TestingVulnerability-Assessment',
          source: '25',
          target: '214',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000149',
          name: 'Security-AwarenessData-Security',
          source: '23',
          target: '82',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000150',
          name: 'Security-AwarenessDigital-Communications',
          source: '23',
          target: '84',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000151',
          name: 'Security-AwarenessMobile-Device-Security',
          source: '23',
          target: '143',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000152',
          name: 'Security-AwarenessPersonally-Identifiable-Information-(PII)',
          source: '23',
          target: '156',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000153',
          name: 'Security-AwarenessSocial-Networking-and-Engineering',
          source: '23',
          target: '186',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000154',
          name: 'DatabasesAzure-Cosmos-DB',
          source: '14',
          target: '50',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000155',
          name: 'DatabasesMariaDB',
          source: '14',
          target: '122',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000156',
          name: 'Mob-DevelopmentAndroid',
          source: '20',
          target: '39',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000157',
          name: 'Mob-DevelopmentFlutter',
          source: '20',
          target: '91',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000158',
          name: 'Mob-DevelopmentiOS',
          source: '20',
          target: '107',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000159',
          name: 'Mob-DevelopmentKotlin',
          source: '20',
          target: '116',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000160',
          name: 'Mob-DevelopmentReact-Native',
          source: '20',
          target: '176',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000161',
          name: 'Mob-DevelopmentSwift',
          source: '20',
          target: '196',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000162',
          name: 'Mob-DevelopmentXamarin',
          source: '20',
          target: '215',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000163',
          name: 'Programming-LanguagesC#',
          source: '21',
          target: '63',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000164',
          name: 'Programming-LanguagesC++',
          source: '21',
          target: '64',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000165',
          name: 'Programming-LanguagesGo',
          source: '21',
          target: '94',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000166',
          name: 'Programming-LanguagesJava',
          source: '21',
          target: '109',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000167',
          name: 'Programming-LanguagesJavaScript',
          source: '21',
          target: '110',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000168',
          name: 'Programming-LanguagesKotlin',
          source: '21',
          target: '116',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000169',
          name: 'Programming-LanguagesPython',
          source: '21',
          target: '166',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000170',
          name: 'Programming-LanguagesSQL',
          source: '21',
          target: '190',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000171',
          name: 'Programming-LanguagesSwift',
          source: '21',
          target: '196',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000172',
          name: 'Programming-LanguagesTypeScript',
          source: '21',
          target: '204',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000173',
          name: 'Web-DevelopmentAngular',
          source: '29',
          target: '40',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000174',
          name: 'Web-DevelopmentASP.NET-Core',
          source: '29',
          target: '45',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000175',
          name: 'Web-DevelopmentCSS',
          source: '29',
          target: '79',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000176',
          name: 'Web-DevelopmentHTML',
          source: '29',
          target: '104',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000177',
          name: 'Web-DevelopmentJavaScript',
          source: '29',
          target: '110',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000178',
          name: 'Web-DevelopmentNode.js',
          source: '29',
          target: '147',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000179',
          name: 'Web-DevelopmentPHP',
          source: '29',
          target: '157',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000180',
          name: 'Web-DevelopmentPython',
          source: '29',
          target: '166',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000181',
          name: 'Web-DevelopmentReact',
          source: '29',
          target: '175',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000182',
          name: 'Web-DevelopmentRust',
          source: '29',
          target: '179',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000183',
          name: 'Web-DevelopmentTypeScript',
          source: '29',
          target: '204',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000184',
          name: 'DevOpsTerraform',
          source: '16',
          target: '201',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000185',
          name: 'DevOpsJenkins',
          source: '16',
          target: '112',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000186',
          name: 'DevOpsHyperspace',
          source: '16',
          target: '105',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000187',
          name: 'TestingKarate',
          source: '27',
          target: '114',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000188',
          name: 'TestingSauceLabs',
          source: '27',
          target: '181',
        },
        group: 'edges',
      },
      {
        data: {
          id: '1000189',
          name: 'SocialFacebook-Integration',
          source: '26',
          target: '89',
        },
        group: 'edges',
      },
    ],
  };
}
