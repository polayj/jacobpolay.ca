---
title: "EarlyModernNER"
summary: "Named-entity recognition for early modern English, and the open pipeline around it for transcription and knowledge-graph retrieval, built for my MA thesis."
status: complete
role: Designer and developer (MA thesis)
order: 2
links:
  - label: EarlyModernNER on GitHub
    href: https://github.com/polayj/earlymodernner
  - label: "MA thesis: Loud Yet Invisible"
    href: https://harvest.usask.ca/server/api/core/bitstreams/b3df6dab-7b8c-4df7-b6e3-28d323203e8c/content
collaborators: [Jim Clifford]
methods: [OCR, Named-entity recognition, Knowledge graphs, GraphRAG]
related: [talk:reading-the-unreadable, talk:fitting-machine-to-page]
---
My MA thesis, *Loud Yet Invisible: A Humanist-Designed Pipeline for Unlocking the Early Modern Archive*, built a pipeline for reading a corpus of about 20,000 printed documents (roughly two million pages) from 1614 to 1810, with ginger as a case study.

The pipeline runs olmOCR transcription, then EarlyModernNER, a custom named-entity recognition model, then a knowledge graph, then GraphRAG retrieval. It is designed as a discovery, search and ranking tool for historians rather than an automated answer machine, and it includes methodological work on transcription error rates and gold-standard ground truth for early modern documents.
