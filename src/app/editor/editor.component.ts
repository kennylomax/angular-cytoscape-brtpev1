import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  Injectable,
  NgZone,
} from '@angular/core';

import cytoscape = require('cytoscape');

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit {
  public cy: cytoscape.Core;

  selectedName: string = '<None selected>'; //klx
  scratchPad: string = '<None selected>'; //klx

  public mystyle = [
    // the stylesheet for the graph
    {
      selector: 'node',
      style: {
        'font-family': 'helvetica',
        'text-valign': 'center',
        label: 'data(name)',
        width: 'mapData(skillgap, 0, 100, 10, 100)',
        height: 'mapData(skillgap, 0, 100, 10, 100)',
        'font-size': 'mapData(skillgap, 0, 100, 10, 100)',
        color: (ele) => {
          if (this.scratchPad == ele.data().name) {
            return 'red';
          }
          return 'green';
        },
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'curve-style': 'bezier',
      },
    },
    {
      selector: 'node[type= "bendPoint"]',
      style: {
        width: '.00001px',
        height: '.00001px',
      },
    },
  ];

  public showAllStyle: cytoscape.Stylesheet[] = this.mystyle;

  ngOnInit() {
    // Initialize cytoscape
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      elements: this.graph,
      style: this.showAllStyle,
      layout: {
        name: 'cose',
        padding: 10,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,
      },
      boxSelectionEnabled: true,
    });

    this.cy.minZoom(0.2);
    this.cy.maxZoom(2);
  }

  removeNode() {
    if (this.cy.filter("[name='" + this.scratchPad + "']").degree(false) == 1)
      this.cy.remove('[name ="' + this.scratchPad + '"]');
  }

  adjustweight(delta) {
    let weight = this.cy
      .filter('[name ="' + this.selectedName + '"]')
      .first()
      .data('skillgap');
    this.cy
      .filter('[name ="' + this.selectedName + '"]')
      .first()
      .data('skillgap', weight + delta);
  }

  search() {
    this.selectedName = this.scratchPad;
    this.redraw();
  }

  redraw() {
    this.cy.json({ style: this.mystyle });
  }

  rename() {
    this.cy
      .nodes()
      .filter("[name='" + this.selectedName + "']")
      .first()
      .data('name', this.scratchPad);
    this.selectedName = this.scratchPad;
  }

  generateUniqSerial(): string {
    return 'xxxx-xxxx-xxx-xxxx'.replace(/[x]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      return r.toString(16);
    });
  }

  addchild() {
    var newid = this.generateUniqSerial();

    this.cy.add([
      {
        group: 'nodes',
        data: {
          type: 'node',
          id: newid,
          name: this.scratchPad,
          skillgap: 1,
        },
      },
      {
        group: 'edges',
        data: {
          name: this.scratchPad + '_edge',
          skillgap: null,
          id: newid + '0',
          source: this.selectedName,
          target: newid,
        },
      },
    ]);
    this.redraw();
  }

  evtListener() {
    this.cy.one('tap', (event) => {
      var evtTarget = event.target;
      if (evtTarget && evtTarget.isNode && evtTarget.isNode()) {
        this.scratchPad = evtTarget.data('name');
        this.selectedName = evtTarget.data('name');
        this.redraw();
      } else if (evtTarget && evtTarget.isEdge && evtTarget.isEdge()) {
        console.log('this is an edge');
      } else {
        console.log('this is the background');
      }
    });
  }

  public graph: any = {
    nodes: [
      {
        data: {
          type: 'node',
          id: 'Cloud',
          name: 'Cloud',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Data And Machine Learning',
          name: 'Data And Machine Learning',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'IT Ops',
          name: 'IT Ops',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Security ',
          name: 'Security ',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Software Development',
          name: 'Software Development',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Big Data',
          name: 'Big Data',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Business Intelligence',
          name: 'Business Intelligence',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Certifications',
          name: 'Certifications',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Cloud Architecture And Design',
          name: 'Cloud Architecture And Design',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Cloud Platforms',
          name: 'Cloud Platforms',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Configuration Management',
          name: 'Configuration Management',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Containers',
          name: 'Containers',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Data Visualization',
          name: 'Data Visualization',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Databases',
          name: 'Databases',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Databases',
          name: 'Databases',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'DevOps',
          name: 'DevOps',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'IT Automation',
          name: 'IT Automation',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Languages and Libraries',
          name: 'Languages and Libraries',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Machine Learning',
          name: 'Machine Learning',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Mobile Development',
          name: 'Mobile Development',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Programming Languages',
          name: 'Programming Languages',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Security Architecture And Engineering',
          name: 'Security Architecture And Engineering',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Security Awareness',
          name: 'Security Awareness',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Security Operations',
          name: 'Security Operations',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Security Testing',
          name: 'Security Testing',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Social',
          name: 'Social',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Testing',
          name: 'Testing',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Virtualization',
          name: 'Virtualization',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Web Development',
          name: 'Web Development',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Alteryx',
          name: 'Alteryx',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Alteryx',
          name: 'Alteryx',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Amazon Data Pipeline',
          name: 'Amazon Data Pipeline',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Amazon DynamoDB',
          name: 'Amazon DynamoDB',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Amazon DynamoDB',
          name: 'Amazon DynamoDB',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Amazon Elastic Container Service (ECS)',
          name: 'Amazon Elastic Container Service (ECS)',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Amazon ElastiCache',
          name: 'Amazon ElastiCache',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Amazon ElastiCache',
          name: 'Amazon ElastiCache',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Amazon Web Services (AWS)',
          name: 'Amazon Web Services (AWS)',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Android',
          name: 'Android',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Angular',
          name: 'Angular',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Apache Cassandra',
          name: 'Apache Cassandra',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Apache Kafka',
          name: 'Apache Kafka',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Apache Spark',
          name: 'Apache Spark',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Artificial Intelligence (AI)',
          name: 'Artificial Intelligence (AI)',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'ASP.NET Core',
          name: 'ASP.NET Core',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'AWS Certified Solutions Architect - Associate SAA-C02',
          name: 'AWS Certified Solutions Architect - Associate SAA-C02',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'AWS Certified Solutions Architect - Professional SAP-C01',
          name: 'AWS Certified Solutions Architect - Professional SAP-C01',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Azure Automation',
          name: 'Azure Automation',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Azure Automation DSC',
          name: 'Azure Automation DSC',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Azure Cosmos DB',
          name: 'Azure Cosmos DB',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Azure HDInsight',
          name: 'Azure HDInsight',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Azure Kubernetes Service (AKS)',
          name: 'Azure Kubernetes Service (AKS)',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Azure Machine Learning',
          name: 'Azure Machine Learning',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Azure Red Hat OpenShift',
          name: 'Azure Red Hat OpenShift',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Azure SQL',
          name: 'Azure SQL',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Azure SQL',
          name: 'Azure SQL',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Azure SQL Data Warehouse',
          name: 'Azure SQL Data Warehouse',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Azure SQL Data Warehouse',
          name: 'Azure SQL Data Warehouse',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Azure Web App for Containers',
          name: 'Azure Web App for Containers',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Bash',
          name: 'Bash',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'BeautifulSoup',
          name: 'BeautifulSoup',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Big Data Principles',
          name: 'Big Data Principles',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'C#',
          name: 'C#',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'C++',
          name: 'C++',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Caching',
          name: 'Caching',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'CCSP',
          name: 'CCSP',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'CEH',
          name: 'CEH',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Certified Chef Developer',
          name: 'Certified Chef Developer',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Certified Kubernetes Administrator',
          name: 'Certified Kubernetes Administrator',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Chef',
          name: 'Chef',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'CISA',
          name: 'CISA',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'CISM',
          name: 'CISM',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'CISSP',
          name: 'CISSP',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Citrix CCA-V',
          name: 'Citrix CCA-V',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Citrix CCP-V',
          name: 'Citrix CCP-V',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Cloudera Distribution Hadoop (CDH)',
          name: 'Cloudera Distribution Hadoop (CDH)',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'CompTIA Security+',
          name: 'CompTIA Security+',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Continuous Monitoring and Detection',
          name: 'Continuous Monitoring and Detection',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'CSS',
          name: 'CSS',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'CySA+',
          name: 'CySA+',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'D3',
          name: 'D3',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Data Security',
          name: 'Data Security',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Deep Learning',
          name: 'Deep Learning',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Digital Communications',
          name: 'Digital Communications',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Digital Forensics',
          name: 'Digital Forensics',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Docker',
          name: 'Docker',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Docker Swarm',
          name: 'Docker Swarm',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Enterprise Security Infrastructure',
          name: 'Enterprise Security Infrastructure',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Facebook Integration',
          name: 'Facebook Integration',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Feature Engineering',
          name: 'Feature Engineering',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Flutter',
          name: 'Flutter',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'General Business Intelligence Principles',
          name: 'General Business Intelligence Principles',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'ggplot2',
          name: 'ggplot2',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Go',
          name: 'Go',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Google Charts',
          name: 'Google Charts',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Google Cloud Platform',
          name: 'Google Cloud Platform',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Google Cloud Spanner',
          name: 'Google Cloud Spanner',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Google Container Registry',
          name: 'Google Container Registry',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Google Kubernetes Engine',
          name: 'Google Kubernetes Engine',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Google Professional Cloud Architect',
          name: 'Google Professional Cloud Architect',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Group Policy',
          name: 'Group Policy',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Hadoop',
          name: 'Hadoop',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Heroku',
          name: 'Heroku',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'HTML',
          name: 'HTML',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Hyperspace',
          name: 'Hyperspace',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Incident Response',
          name: 'Incident Response',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'iOS',
          name: 'iOS',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Istio',
          name: 'Istio',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Java',
          name: 'Java',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'JavaScript',
          name: 'JavaScript',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'JavaScript',
          name: 'JavaScript',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Jenkins',
          name: 'Jenkins',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Jupyter',
          name: 'Jupyter',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Karate',
          name: 'Karate',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Keras',
          name: 'Keras',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Kotlin',
          name: 'Kotlin',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Kotlin',
          name: 'Kotlin',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Kubernetes',
          name: 'Kubernetes',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Machine Learning Literacy',
          name: 'Machine Learning Literacy',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Malware Analysis',
          name: 'Malware Analysis',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'MapReduce',
          name: 'MapReduce',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'MariaDB',
          name: 'MariaDB',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'matplotlib',
          name: 'matplotlib',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Azure',
          name: 'Microsoft Azure',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Azure Architect Design AZ-301',
          name: 'Microsoft Azure Architect Design AZ-301',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Azure Architect Design AZ-304',
          name: 'Microsoft Azure Architect Design AZ-304',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Azure Architect Technologies AZ-300',
          name: 'Microsoft Azure Architect Technologies AZ-300',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Azure Architect Technologies AZ-303',
          name: 'Microsoft Azure Architect Technologies AZ-303',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Azure Architecture Fundamentals',
          name: 'Microsoft Azure Architecture Fundamentals',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Azure Blob Storage',
          name: 'Microsoft Azure Blob Storage',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Azure Data Lake',
          name: 'Microsoft Azure Data Lake',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Azure DevOps',
          name: 'Microsoft Azure DevOps',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Desired State Configuration (DSC)',
          name: 'Microsoft Desired State Configuration (DSC)',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Excel',
          name: 'Microsoft Excel',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Hyper-V',
          name: 'Microsoft Hyper-V',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Intune',
          name: 'Microsoft Intune',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Orca',
          name: 'Microsoft Orca',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Power Automate',
          name: 'Microsoft Power Automate',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft Power BI',
          name: 'Microsoft Power BI',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft SQL Server',
          name: 'Microsoft SQL Server',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft SQL Server',
          name: 'Microsoft SQL Server',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Microsoft StreamInsight',
          name: 'Microsoft StreamInsight',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Mobile Device Security',
          name: 'Mobile Device Security',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'MySQL',
          name: 'MySQL',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'MySQL',
          name: 'MySQL',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Neural Networks (NNs)',
          name: 'Neural Networks (NNs)',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Node.js',
          name: 'Node.js',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'NuGet',
          name: 'NuGet',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'NumPy',
          name: 'NumPy',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'OpenStack',
          name: 'OpenStack',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Oracle Business Intelligence',
          name: 'Oracle Business Intelligence',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Oracle Cloud Platform',
          name: 'Oracle Cloud Platform',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'pandas',
          name: 'pandas',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Penetration Testing',
          name: 'Penetration Testing',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'PenTest+',
          name: 'PenTest+',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Personally Identifiable Information (PII)',
          name: 'Personally Identifiable Information (PII)',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'PHP',
          name: 'PHP',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'PostgreSQL',
          name: 'PostgreSQL',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'PostgreSQL',
          name: 'PostgreSQL',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'PowerShell',
          name: 'PowerShell',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'PowerShell Core',
          name: 'PowerShell Core',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Predictive Analytics',
          name: 'Predictive Analytics',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Puppet',
          name: 'Puppet',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Puppet Bolt',
          name: 'Puppet Bolt',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'pygal',
          name: 'pygal',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Python',
          name: 'Python',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Python',
          name: 'Python',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Python',
          name: 'Python',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Python',
          name: 'Python',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'PyTorch',
          name: 'PyTorch',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Qlik Sense',
          name: 'Qlik Sense',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'R',
          name: 'R',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'R',
          name: 'R',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'R',
          name: 'R',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'React',
          name: 'React',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'React Native',
          name: 'React Native',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Red Hat Certified System Administrator in Red Hat Openstack',
          name: 'Red Hat Certified System Administrator in Red Hat Openstack',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Red Teaming',
          name: 'Red Teaming',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Rust',
          name: 'Rust',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Salt',
          name: 'Salt',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'SauceLabs',
          name: 'SauceLabs',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'scikit-image',
          name: 'scikit-image',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'scikit-learn',
          name: 'scikit-learn',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Scrapy',
          name: 'Scrapy',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Security Operations Engineering',
          name: 'Security Operations Engineering',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Social Networking and Engineering',
          name: 'Social Networking and Engineering',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Splunk',
          name: 'Splunk',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Spring Cloud',
          name: 'Spring Cloud',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'SpringBoot',
          name: 'SpringBoot',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'SQL',
          name: 'SQL',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'SQL Server Reporting Services',
          name: 'SQL Server Reporting Services',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'SQLite',
          name: 'SQLite',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'SQLite',
          name: 'SQLite',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'SSAS',
          name: 'SSAS',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'SSIS',
          name: 'SSIS',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Swift',
          name: 'Swift',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Swift',
          name: 'Swift',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'System Center Configuration Manager',
          name: 'System Center Configuration Manager',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Tableau',
          name: 'Tableau',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Tensorflow',
          name: 'Tensorflow',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Terraform',
          name: 'Terraform',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Threat Hunting',
          name: 'Threat Hunting',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Threat Intelligence',
          name: 'Threat Intelligence',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'TypeScript',
          name: 'TypeScript',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'TypeScript',
          name: 'TypeScript',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Vagrant',
          name: 'Vagrant',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Visualization Principles',
          name: 'Visualization Principles',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'VMware Certified Associate',
          name: 'VMware Certified Associate',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'VMware Cloud',
          name: 'VMware Cloud',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'VMware Fusion',
          name: 'VMware Fusion',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'VMware Horizon',
          name: 'VMware Horizon',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'VMware User Environment Manager',
          name: 'VMware User Environment Manager',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'VMware vCloud',
          name: 'VMware vCloud',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Vulnerability Assessment',
          name: 'Vulnerability Assessment',
          skillgap: 1,
        },
        group: 'nodes',
      },
      {
        data: {
          type: 'node',
          id: 'Xamarin',
          name: 'Xamarin',
          skillgap: 1,
        },
        group: 'nodes',
      },
    ],
    edges: [
      {
        data: {
          type: 'bendPoint',
          id: '0',
          name: 'Security-Certifications',
          skillgap: null,
          source: 'Security ',
          target: 'Certifications',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '1',
          name: 'IT-OpsConfiguration-Management',
          skillgap: null,
          source: 'IT Ops',
          target: 'Configuration Management',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '2',
          name: 'IT-OpsIT-Automation',
          skillgap: null,
          source: 'IT Ops',
          target: 'IT Automation',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '3',
          name: 'IT-OpsVirtualization',
          skillgap: null,
          source: 'IT Ops',
          target: 'Virtualization',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '4',
          name: 'Security-Security-Architecture-And-Engineering',
          skillgap: null,
          source: 'Security ',
          target: 'Security Architecture And Engineering',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '5',
          name: 'Security-Security-Operations',
          skillgap: null,
          source: 'Security ',
          target: 'Security Operations',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '6',
          name: 'Security-Security-Testing',
          skillgap: null,
          source: 'Security ',
          target: 'Security Testing',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '7',
          name: 'Security-Security-Awareness',
          skillgap: null,
          source: 'Security ',
          target: 'Security Awareness',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '8',
          name: 'Software-DevelopmentMobile-Development',
          skillgap: null,
          source: 'Software Development',
          target: 'Mobile Development',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '9',
          name: 'Software-DevelopmentProgramming-Languages',
          skillgap: null,
          source: 'Software Development',
          target: 'Programming Languages',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '10',
          name: 'Software-DevelopmentWeb-Development',
          skillgap: null,
          source: 'Software Development',
          target: 'Web Development',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '11',
          name: 'Software-DevelopmentDevOps',
          skillgap: null,
          source: 'Software Development',
          target: 'DevOps',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '12',
          name: 'Software-DevelopmentTesting',
          skillgap: null,
          source: 'Software Development',
          target: 'Testing',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '13',
          name: 'Software-DevelopmentSocial',
          skillgap: null,
          source: 'Software Development',
          target: 'Social',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '14',
          name: 'Cloud-Architecture-And-DesignAWS-Certified-Solutions-Architect---Associate-SAA-C02',
          skillgap: null,
          source: 'Cloud Architecture And Design',
          target: 'AWS Certified Solutions Architect - Associate SAA-C02',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '15',
          name: 'Cloud-Architecture-And-DesignAWS-Certified-Solutions-Architect---Professional-SAP-C01',
          skillgap: null,
          source: 'Cloud Architecture And Design',
          target: 'AWS Certified Solutions Architect - Professional SAP-C01',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '16',
          name: 'Cloud-Architecture-And-DesignGoogle-Professional-Cloud-Architect',
          skillgap: null,
          source: 'Cloud Architecture And Design',
          target: 'Google Professional Cloud Architect',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '17',
          name: 'Cloud-Architecture-And-DesignMicrosoft-Azure-Architect-Design-AZ-301',
          skillgap: null,
          source: 'Cloud Architecture And Design',
          target: 'Microsoft Azure Architect Design AZ-301',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '18',
          name: 'Cloud-Architecture-And-DesignMicrosoft-Azure-Architect-Design-AZ-304',
          skillgap: null,
          source: 'Cloud Architecture And Design',
          target: 'Microsoft Azure Architect Design AZ-304',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '19',
          name: 'Cloud-Architecture-And-DesignMicrosoft-Azure-Architect-Technologies-AZ-300',
          skillgap: null,
          source: 'Cloud Architecture And Design',
          target: 'Microsoft Azure Architect Technologies AZ-300',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '20',
          name: 'Cloud-Architecture-And-DesignMicrosoft-Azure-Architect-Technologies-AZ-303',
          skillgap: null,
          source: 'Cloud Architecture And Design',
          target: 'Microsoft Azure Architect Technologies AZ-303',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '21',
          name: 'Cloud-Architecture-And-DesignMicrosoft-Azure-Architecture-Fundamentals',
          skillgap: null,
          source: 'Cloud Architecture And Design',
          target: 'Microsoft Azure Architecture Fundamentals',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '22',
          name: 'Cloud-PlatformsAmazon-Web-Services-(AWS)',
          skillgap: null,
          source: 'Cloud Platforms',
          target: 'Amazon Web Services (AWS)',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '23',
          name: 'Cloud-PlatformsGoogle-Cloud-Platform',
          skillgap: null,
          source: 'Cloud Platforms',
          target: 'Google Cloud Platform',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '24',
          name: 'Cloud-PlatformsHeroku',
          skillgap: null,
          source: 'Cloud Platforms',
          target: 'Heroku',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '25',
          name: 'Cloud-PlatformsMicrosoft-Azure',
          skillgap: null,
          source: 'Cloud Platforms',
          target: 'Microsoft Azure',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '26',
          name: 'Cloud-PlatformsMicrosoft-Azure-Blob-Storage',
          skillgap: null,
          source: 'Cloud Platforms',
          target: 'Microsoft Azure Blob Storage',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '27',
          name: 'Cloud-PlatformsMicrosoft-Azure-Data-Lake',
          skillgap: null,
          source: 'Cloud Platforms',
          target: 'Microsoft Azure Data Lake',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '28',
          name: 'Cloud-PlatformsMicrosoft-Azure-DevOps',
          skillgap: null,
          source: 'Cloud Platforms',
          target: 'Microsoft Azure DevOps',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '29',
          name: 'Cloud-PlatformsOracle-Cloud-Platform',
          skillgap: null,
          source: 'Cloud Platforms',
          target: 'Oracle Cloud Platform',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '30',
          name: 'Cloud-PlatformsSpring-Cloud',
          skillgap: null,
          source: 'Cloud Platforms',
          target: 'Spring Cloud',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '31',
          name: 'Cloud-PlatformsVMware-Cloud',
          skillgap: null,
          source: 'Cloud Platforms',
          target: 'VMware Cloud',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '32',
          name: 'Big-DataAmazon-Data-Pipeline',
          skillgap: null,
          source: 'Big Data',
          target: 'Amazon Data Pipeline',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '33',
          name: 'Big-DataApache-Cassandra',
          skillgap: null,
          source: 'Big Data',
          target: 'Apache Cassandra',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '34',
          name: 'Big-DataApache-Kafka',
          skillgap: null,
          source: 'Big Data',
          target: 'Apache Kafka',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '35',
          name: 'Big-DataAzure-HDInsight',
          skillgap: null,
          source: 'Big Data',
          target: 'Azure HDInsight',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '36',
          name: 'Big-DataBig-Data-Principles',
          skillgap: null,
          source: 'Big Data',
          target: 'Big Data Principles',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '37',
          name: 'Big-DataCloudera-Distribution-Hadoop-(CDH)',
          skillgap: null,
          source: 'Big Data',
          target: 'Cloudera Distribution Hadoop (CDH)',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '38',
          name: 'Big-DataHadoop',
          skillgap: null,
          source: 'Big Data',
          target: 'Hadoop',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '39',
          name: 'Big-DataMapReduce',
          skillgap: null,
          source: 'Big Data',
          target: 'MapReduce',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '40',
          name: 'Big-DataMicrosoft-StreamInsight',
          skillgap: null,
          source: 'Big Data',
          target: 'Microsoft StreamInsight',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '41',
          name: 'Big-DataSplunk',
          skillgap: null,
          source: 'Big Data',
          target: 'Splunk',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '42',
          name: 'Business-IntelligenceAlteryx',
          skillgap: null,
          source: 'Business Intelligence',
          target: 'Alteryx',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '43',
          name: 'Business-IntelligenceGeneral-Business-Intelligence-Principles',
          skillgap: null,
          source: 'Business Intelligence',
          target: 'General Business Intelligence Principles',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '44',
          name: 'Business-IntelligenceMicrosoft-Excel',
          skillgap: null,
          source: 'Business Intelligence',
          target: 'Microsoft Excel',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '45',
          name: 'Business-IntelligenceMicrosoft-Power-BI',
          skillgap: null,
          source: 'Business Intelligence',
          target: 'Microsoft Power BI',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '46',
          name: 'Business-IntelligenceOracle-Business-Intelligence',
          skillgap: null,
          source: 'Business Intelligence',
          target: 'Oracle Business Intelligence',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '47',
          name: 'Business-IntelligencePredictive-Analytics',
          skillgap: null,
          source: 'Business Intelligence',
          target: 'Predictive Analytics',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '48',
          name: 'Business-IntelligenceSQL-Server-Reporting-Services',
          skillgap: null,
          source: 'Business Intelligence',
          target: 'SQL Server Reporting Services',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '49',
          name: 'Business-IntelligenceSSAS',
          skillgap: null,
          source: 'Business Intelligence',
          target: 'SSAS',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '50',
          name: 'Business-IntelligenceSSIS',
          skillgap: null,
          source: 'Business Intelligence',
          target: 'SSIS',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '51',
          name: 'Business-IntelligenceTableau',
          skillgap: null,
          source: 'Business Intelligence',
          target: 'Tableau',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '52',
          name: 'Data-VisualizationAlteryx',
          skillgap: null,
          source: 'Data Visualization',
          target: 'Alteryx',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '53',
          name: 'Data-VisualizationD3',
          skillgap: null,
          source: 'Data Visualization',
          target: 'D3',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '54',
          name: 'Data-Visualizationggplot2',
          skillgap: null,
          source: 'Data Visualization',
          target: 'ggplot2',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '55',
          name: 'Data-VisualizationGoogle-Charts',
          skillgap: null,
          source: 'Data Visualization',
          target: 'Google Charts',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '56',
          name: 'Data-VisualizationJupyter',
          skillgap: null,
          source: 'Data Visualization',
          target: 'Jupyter',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '57',
          name: 'Data-Visualizationmatplotlib',
          skillgap: null,
          source: 'Data Visualization',
          target: 'matplotlib',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '58',
          name: 'Data-Visualizationpygal',
          skillgap: null,
          source: 'Data Visualization',
          target: 'pygal',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '59',
          name: 'Data-VisualizationQlik-Sense',
          skillgap: null,
          source: 'Data Visualization',
          target: 'Qlik Sense',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '60',
          name: 'Data-VisualizationR',
          skillgap: null,
          source: 'Data Visualization',
          target: 'R',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '61',
          name: 'Data-VisualizationVisualization-Principles',
          skillgap: null,
          source: 'Data Visualization',
          target: 'Visualization Principles',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '62',
          name: 'DatabasesAmazon-DynamoDB',
          skillgap: null,
          source: 'Databases',
          target: 'Amazon DynamoDB',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '63',
          name: 'DatabasesAmazon-ElastiCache',
          skillgap: null,
          source: 'Databases',
          target: 'Amazon ElastiCache',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '64',
          name: 'DatabasesAzure-SQL',
          skillgap: null,
          source: 'Databases',
          target: 'Azure SQL',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '65',
          name: 'DatabasesAzure-SQL-Data-Warehouse',
          skillgap: null,
          source: 'Databases',
          target: 'Azure SQL Data Warehouse',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '66',
          name: 'DatabasesCaching',
          skillgap: null,
          source: 'Databases',
          target: 'Caching',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '67',
          name: 'DatabasesGoogle-Cloud-Spanner',
          skillgap: null,
          source: 'Databases',
          target: 'Google Cloud Spanner',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '68',
          name: 'DatabasesMicrosoft-SQL-Server',
          skillgap: null,
          source: 'Databases',
          target: 'Microsoft SQL Server',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '69',
          name: 'DatabasesMySQL',
          skillgap: null,
          source: 'Databases',
          target: 'MySQL',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '70',
          name: 'DatabasesPostgreSQL',
          skillgap: null,
          source: 'Databases',
          target: 'PostgreSQL',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '71',
          name: 'DatabasesSQLite',
          skillgap: null,
          source: 'Databases',
          target: 'SQLite',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '72',
          name: 'Languages-and-LibrariesApache-Spark',
          skillgap: null,
          source: 'Languages and Libraries',
          target: 'Apache Spark',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '73',
          name: 'Languages-and-LibrariesBeautifulSoup',
          skillgap: null,
          source: 'Languages and Libraries',
          target: 'BeautifulSoup',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '74',
          name: 'Languages-and-LibrariesKeras',
          skillgap: null,
          source: 'Languages and Libraries',
          target: 'Keras',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '75',
          name: 'Languages-and-LibrariesNumPy',
          skillgap: null,
          source: 'Languages and Libraries',
          target: 'NumPy',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '76',
          name: 'Languages-and-Librariespandas',
          skillgap: null,
          source: 'Languages and Libraries',
          target: 'pandas',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '77',
          name: 'Languages-and-LibrariesR',
          skillgap: null,
          source: 'Languages and Libraries',
          target: 'R',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '78',
          name: 'Languages-and-Librariesscikit-image',
          skillgap: null,
          source: 'Languages and Libraries',
          target: 'scikit-image',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '79',
          name: 'Languages-and-LibrariesSpringBoot',
          skillgap: null,
          source: 'Languages and Libraries',
          target: 'SpringBoot',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '80',
          name: 'Languages-and-Librariesscikit-learn',
          skillgap: null,
          source: 'Languages and Libraries',
          target: 'scikit-learn',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '81',
          name: 'Languages-and-LibrariesScrapy',
          skillgap: null,
          source: 'Languages and Libraries',
          target: 'Scrapy',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '82',
          name: 'Machine-LearningArtificial-Intelligence-(AI)',
          skillgap: null,
          source: 'Machine Learning',
          target: 'Artificial Intelligence (AI)',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '83',
          name: 'Machine-LearningAzure-Machine-Learning',
          skillgap: null,
          source: 'Machine Learning',
          target: 'Azure Machine Learning',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '84',
          name: 'Machine-LearningDeep-Learning',
          skillgap: null,
          source: 'Machine Learning',
          target: 'Deep Learning',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '85',
          name: 'Machine-LearningFeature-Engineering',
          skillgap: null,
          source: 'Machine Learning',
          target: 'Feature Engineering',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '86',
          name: 'Machine-LearningMachine-Learning-Literacy',
          skillgap: null,
          source: 'Machine Learning',
          target: 'Machine Learning Literacy',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '87',
          name: 'Machine-LearningNeural-Networks-(NNs)',
          skillgap: null,
          source: 'Machine Learning',
          target: 'Neural Networks (NNs)',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '88',
          name: 'Machine-LearningPyTorch',
          skillgap: null,
          source: 'Machine Learning',
          target: 'PyTorch',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '89',
          name: 'Machine-LearningR',
          skillgap: null,
          source: 'Machine Learning',
          target: 'R',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '90',
          name: 'Machine-LearningTensorflow',
          skillgap: null,
          source: 'Machine Learning',
          target: 'Tensorflow',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '91',
          name: 'Configuration-ManagementCertified-Chef-Developer',
          skillgap: null,
          source: 'Configuration Management',
          target: 'Certified Chef Developer',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '92',
          name: 'Configuration-ManagementChef',
          skillgap: null,
          source: 'Configuration Management',
          target: 'Chef',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '93',
          name: 'Configuration-ManagementGroup-Policy',
          skillgap: null,
          source: 'Configuration Management',
          target: 'Group Policy',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '94',
          name: 'Configuration-ManagementMicrosoft-Desired-State-Configuration-(DSC)',
          skillgap: null,
          source: 'Configuration Management',
          target: 'Microsoft Desired State Configuration (DSC)',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '95',
          name: 'Configuration-ManagementMicrosoft-Intune',
          skillgap: null,
          source: 'Configuration Management',
          target: 'Microsoft Intune',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '96',
          name: 'Configuration-ManagementPuppet',
          skillgap: null,
          source: 'Configuration Management',
          target: 'Puppet',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '97',
          name: 'Configuration-ManagementPuppet-Bolt',
          skillgap: null,
          source: 'Configuration Management',
          target: 'Puppet Bolt',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '98',
          name: 'Configuration-ManagementSalt',
          skillgap: null,
          source: 'Configuration Management',
          target: 'Salt',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '99',
          name: 'Configuration-ManagementSystem-Center-Configuration-Manager',
          skillgap: null,
          source: 'Configuration Management',
          target: 'System Center Configuration Manager',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '100',
          name: 'Configuration-ManagementVagrant',
          skillgap: null,
          source: 'Configuration Management',
          target: 'Vagrant',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '101',
          name: 'ContainersAmazon-Elastic-Container-Service-(ECS)',
          skillgap: null,
          source: 'Containers',
          target: 'Amazon Elastic Container Service (ECS)',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '102',
          name: 'ContainersAzure-Kubernetes-Service-(AKS)',
          skillgap: null,
          source: 'Containers',
          target: 'Azure Kubernetes Service (AKS)',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '103',
          name: 'ContainersAzure-Red-Hat-OpenShift',
          skillgap: null,
          source: 'Containers',
          target: 'Azure Red Hat OpenShift',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '104',
          name: 'ContainersAzure-Web-App-for-Containers',
          skillgap: null,
          source: 'Containers',
          target: 'Azure Web App for Containers',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '105',
          name: 'ContainersCertified-Kubernetes-Administrator',
          skillgap: null,
          source: 'Containers',
          target: 'Certified Kubernetes Administrator',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '106',
          name: 'ContainersDocker',
          skillgap: null,
          source: 'Containers',
          target: 'Docker',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '107',
          name: 'ContainersIstio',
          skillgap: null,
          source: 'Containers',
          target: 'Istio',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '108',
          name: 'ContainersDocker-Swarm',
          skillgap: null,
          source: 'Containers',
          target: 'Docker Swarm',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '109',
          name: 'ContainersGoogle-Container-Registry',
          skillgap: null,
          source: 'Containers',
          target: 'Google Container Registry',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '110',
          name: 'ContainersGoogle-Kubernetes-Engine',
          skillgap: null,
          source: 'Containers',
          target: 'Google Kubernetes Engine',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '111',
          name: 'ContainersKubernetes',
          skillgap: null,
          source: 'Containers',
          target: 'Kubernetes',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '112',
          name: 'IT-AutomationAzure-Automation',
          skillgap: null,
          source: 'IT Automation',
          target: 'Azure Automation',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '113',
          name: 'IT-AutomationAzure-Automation-DSC',
          skillgap: null,
          source: 'IT Automation',
          target: 'Azure Automation DSC',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '114',
          name: 'IT-AutomationBash',
          skillgap: null,
          source: 'IT Automation',
          target: 'Bash',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '115',
          name: 'IT-AutomationMicrosoft-Orca',
          skillgap: null,
          source: 'IT Automation',
          target: 'Microsoft Orca',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '116',
          name: 'IT-AutomationMicrosoft-Power-Automate',
          skillgap: null,
          source: 'IT Automation',
          target: 'Microsoft Power Automate',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '117',
          name: 'IT-AutomationNuGet',
          skillgap: null,
          source: 'IT Automation',
          target: 'NuGet',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '118',
          name: 'IT-AutomationPowerShell',
          skillgap: null,
          source: 'IT Automation',
          target: 'PowerShell',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '119',
          name: 'IT-AutomationPowerShell-Core',
          skillgap: null,
          source: 'IT Automation',
          target: 'PowerShell Core',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '120',
          name: 'VirtualizationCitrix-CCA-V',
          skillgap: null,
          source: 'Virtualization',
          target: 'Citrix CCA-V',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '121',
          name: 'VirtualizationCitrix-CCP-V',
          skillgap: null,
          source: 'Virtualization',
          target: 'Citrix CCP-V',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '122',
          name: 'VirtualizationMicrosoft-Hyper-V',
          skillgap: null,
          source: 'Virtualization',
          target: 'Microsoft Hyper-V',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '123',
          name: 'VirtualizationOpenStack',
          skillgap: null,
          source: 'Virtualization',
          target: 'OpenStack',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '124',
          name: 'VirtualizationRed-Hat-Certified-System-Administrator-in-Red-Hat-Openstack',
          skillgap: null,
          source: 'Virtualization',
          target: 'Red Hat Certified System Administrator in Red Hat Openstack',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '125',
          name: 'VirtualizationVMware-Certified-Associate',
          skillgap: null,
          source: 'Virtualization',
          target: 'VMware Certified Associate',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '126',
          name: 'VirtualizationVMware-Fusion',
          skillgap: null,
          source: 'Virtualization',
          target: 'VMware Fusion',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '127',
          name: 'VirtualizationVMware-Horizon',
          skillgap: null,
          source: 'Virtualization',
          target: 'VMware Horizon',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '128',
          name: 'VirtualizationVMware-User-Environment-Manager',
          skillgap: null,
          source: 'Virtualization',
          target: 'VMware User Environment Manager',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '129',
          name: 'VirtualizationVMware-vCloud',
          skillgap: null,
          source: 'Virtualization',
          target: 'VMware vCloud',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '130',
          name: 'CertificationsCCSP',
          skillgap: null,
          source: 'Certifications',
          target: 'CCSP',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '131',
          name: 'CertificationsCEH',
          skillgap: null,
          source: 'Certifications',
          target: 'CEH',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '132',
          name: 'CertificationsCISA',
          skillgap: null,
          source: 'Certifications',
          target: 'CISA',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '133',
          name: 'CertificationsCISM',
          skillgap: null,
          source: 'Certifications',
          target: 'CISM',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '134',
          name: 'CertificationsCISSP',
          skillgap: null,
          source: 'Certifications',
          target: 'CISSP',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '135',
          name: 'CertificationsCompTIA-Security+',
          skillgap: null,
          source: 'Certifications',
          target: 'CompTIA Security+',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '136',
          name: 'CertificationsCySA+',
          skillgap: null,
          source: 'Certifications',
          target: 'CySA+',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '137',
          name: 'CertificationsPenTest+',
          skillgap: null,
          source: 'Certifications',
          target: 'PenTest+',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '138',
          name: 'Security-Architecture-And-EngineeringEnterprise-Security-Infrastructure',
          skillgap: null,
          source: 'Security Architecture And Engineering',
          target: 'Enterprise Security Infrastructure',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '139',
          name: 'Security-Architecture-And-EngineeringSecurity-Operations-Engineering',
          skillgap: null,
          source: 'Security Architecture And Engineering',
          target: 'Security Operations Engineering',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '140',
          name: 'Security-OperationsContinuous-Monitoring-and-Detection',
          skillgap: null,
          source: 'Security Operations',
          target: 'Continuous Monitoring and Detection',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '141',
          name: 'Security-OperationsIncident-Response',
          skillgap: null,
          source: 'Security Operations',
          target: 'Incident Response',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '142',
          name: 'Security-OperationsDigital-Forensics',
          skillgap: null,
          source: 'Security Operations',
          target: 'Digital Forensics',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '143',
          name: 'Security-OperationsMalware-Analysis',
          skillgap: null,
          source: 'Security Operations',
          target: 'Malware Analysis',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '144',
          name: 'Security-OperationsThreat-Hunting',
          skillgap: null,
          source: 'Security Operations',
          target: 'Threat Hunting',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '145',
          name: 'Security-OperationsThreat-Intelligence',
          skillgap: null,
          source: 'Security Operations',
          target: 'Threat Intelligence',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '146',
          name: 'Security-OperationsRed-Teaming',
          skillgap: null,
          source: 'Security Operations',
          target: 'Red Teaming',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '147',
          name: 'Security-TestingPenetration-Testing',
          skillgap: null,
          source: 'Security Testing',
          target: 'Penetration Testing',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '148',
          name: 'Security-TestingVulnerability-Assessment',
          skillgap: null,
          source: 'Security Testing',
          target: 'Vulnerability Assessment',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '149',
          name: 'Security-AwarenessData-Security',
          skillgap: null,
          source: 'Security Awareness',
          target: 'Data Security',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '150',
          name: 'Security-AwarenessDigital-Communications',
          skillgap: null,
          source: 'Security Awareness',
          target: 'Digital Communications',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '151',
          name: 'Security-AwarenessMobile-Device-Security',
          skillgap: null,
          source: 'Security Awareness',
          target: 'Mobile Device Security',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '152',
          name: 'Security-AwarenessPersonally-Identifiable-Information-(PII)',
          skillgap: null,
          source: 'Security Awareness',
          target: 'Personally Identifiable Information (PII)',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '153',
          name: 'Security-AwarenessSocial-Networking-and-Engineering',
          skillgap: null,
          source: 'Security Awareness',
          target: 'Social Networking and Engineering',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '156',
          name: 'DatabasesAzure-Cosmos-DB',
          skillgap: null,
          source: 'Databases',
          target: 'Azure Cosmos DB',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '159',
          name: 'DatabasesMariaDB',
          skillgap: null,
          source: 'Databases',
          target: 'MariaDB',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '164',
          name: 'Mobile-DevelopmentAndroid',
          skillgap: null,
          source: 'Mobile Development',
          target: 'Android',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '165',
          name: 'Mobile-DevelopmentFlutter',
          skillgap: null,
          source: 'Mobile Development',
          target: 'Flutter',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '166',
          name: 'Mobile-DevelopmentiOS',
          skillgap: null,
          source: 'Mobile Development',
          target: 'iOS',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '167',
          name: 'Mobile-DevelopmentKotlin',
          skillgap: null,
          source: 'Mobile Development',
          target: 'Kotlin',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '168',
          name: 'Mobile-DevelopmentReact-Native',
          skillgap: null,
          source: 'Mobile Development',
          target: 'React Native',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '169',
          name: 'Mobile-DevelopmentSwift',
          skillgap: null,
          source: 'Mobile Development',
          target: 'Swift',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '170',
          name: 'Mobile-DevelopmentXamarin',
          skillgap: null,
          source: 'Mobile Development',
          target: 'Xamarin',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '171',
          name: 'Programming-LanguagesC#',
          skillgap: null,
          source: 'Programming Languages',
          target: 'C#',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '172',
          name: 'Programming-LanguagesC++',
          skillgap: null,
          source: 'Programming Languages',
          target: 'C++',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '173',
          name: 'Programming-LanguagesGo',
          skillgap: null,
          source: 'Programming Languages',
          target: 'Go',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '174',
          name: 'Programming-LanguagesJava',
          skillgap: null,
          source: 'Programming Languages',
          target: 'Java',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '175',
          name: 'Programming-LanguagesJavaScript',
          skillgap: null,
          source: 'Programming Languages',
          target: 'JavaScript',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '176',
          name: 'Programming-LanguagesKotlin',
          skillgap: null,
          source: 'Programming Languages',
          target: 'Kotlin',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '177',
          name: 'Programming-LanguagesPython',
          skillgap: null,
          source: 'Programming Languages',
          target: 'Python',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '178',
          name: 'Programming-LanguagesSQL',
          skillgap: null,
          source: 'Programming Languages',
          target: 'SQL',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '179',
          name: 'Programming-LanguagesSwift',
          skillgap: null,
          source: 'Programming Languages',
          target: 'Swift',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '180',
          name: 'Programming-LanguagesTypeScript',
          skillgap: null,
          source: 'Programming Languages',
          target: 'TypeScript',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '181',
          name: 'Web-DevelopmentAngular',
          skillgap: null,
          source: 'Web Development',
          target: 'Angular',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '182',
          name: 'Web-DevelopmentASP.NET-Core',
          skillgap: null,
          source: 'Web Development',
          target: 'ASP.NET Core',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '183',
          name: 'Web-DevelopmentCSS',
          skillgap: null,
          source: 'Web Development',
          target: 'CSS',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '184',
          name: 'Web-DevelopmentHTML',
          skillgap: null,
          source: 'Web Development',
          target: 'HTML',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '185',
          name: 'Web-DevelopmentJavaScript',
          skillgap: null,
          source: 'Web Development',
          target: 'JavaScript',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '186',
          name: 'Web-DevelopmentNode.js',
          skillgap: null,
          source: 'Web Development',
          target: 'Node.js',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '187',
          name: 'Web-DevelopmentPHP',
          skillgap: null,
          source: 'Web Development',
          target: 'PHP',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '188',
          name: 'Web-DevelopmentPython',
          skillgap: null,
          source: 'Web Development',
          target: 'Python',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '189',
          name: 'Web-DevelopmentReact',
          skillgap: null,
          source: 'Web Development',
          target: 'React',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '190',
          name: 'Web-DevelopmentRust',
          skillgap: null,
          source: 'Web Development',
          target: 'Rust',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '191',
          name: 'Web-DevelopmentTypeScript',
          skillgap: null,
          source: 'Web Development',
          target: 'TypeScript',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '192',
          name: 'DevOpsTerraform',
          skillgap: null,
          source: 'DevOps',
          target: 'Terraform',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '193',
          name: 'DevOpsJenkins',
          skillgap: null,
          source: 'DevOps',
          target: 'Jenkins',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '194',
          name: 'DevOpsHyperspace',
          skillgap: null,
          source: 'DevOps',
          target: 'Hyperspace',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '195',
          name: 'TestingKarate',
          skillgap: null,
          source: 'Testing',
          target: 'Karate',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '196',
          name: 'TestingSauceLabs',
          skillgap: null,
          source: 'Testing',
          target: 'SauceLabs',
        },
        group: 'edges',
      },
      {
        data: {
          type: 'bendPoint',
          id: '197',
          name: 'SocialFacebook-Integration',
          skillgap: null,
          source: 'Social',
          target: 'Facebook Integration',
        },
        group: 'edges',
      },
    ],
  };
}
