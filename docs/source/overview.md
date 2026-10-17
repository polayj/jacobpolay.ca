# Source material from Jacob (16 October 2026)

This is Jacob's own overview of his work, as he provided it. It is the source for the site's prose. The CV facts come from `public/Polay_Jacob_CV.pdf`.

Corrections Jacob has given since:
- The AHA talk is titled "Fitting Machine to Page" and is credited to Jacob alone (no co-presenter).
- Describe Jim Clifford as "Professor of History, University of Saskatchewan" and link to https://jimclifford.ca/. Do not use the "(commodity and digital histories, HGIS Lab)" gloss below.
- GitHub is `polayj`. Toolbox: https://github.com/polayj/digital-historians-toolbox. EarlyModernNER: https://github.com/polayj/earlymodernner.
- There is no SSHRC mention anywhere. The comprehensive fields are only "training background", with no detail.

---

## About

Jacob Polay is a PhD student in the Department of History at the University of Saskatchewan, based in Saskatoon. His research sits where early modern history, the history of capitalism, the history of medicine, and AI/NLP methods meet: he builds humanist-designed computational pipelines for reading the archive at scale, and writes critically about how AI products represent historical records.

* PhD student, History, University of Saskatchewan (2026– )
* Supervisor: Dr. Jim Clifford (commodity and digital histories, HGIS Lab)
* Vice-Chair, History Graduate Students' Association (HGSA)

## Education

PhD, History — University of Saskatchewan (in progress, 2026– )
* Comprehensive fields: History of Capitalism (HIST 811, Dr. Jim Clifford) and History of Medicine (Dr. Erika Dyck, Canada Research Chair in the History of Medicine)

MA, History — University of Saskatchewan, defended June 2026
* Thesis: Loud Yet Invisible: A Humanist-Designed Pipeline for Unlocking the Early Modern Archive
* Corpus of ~20,000 printed documents (~2 million pages), 1614–1810, with ginger as a case study
* Pipeline: olmOCR transcription → EarlyModernNER (custom named-entity recognition) → knowledge graph → GraphRAG retrieval ("Improved Scratchpad")
* https://harvest.usask.ca/server/api/core/bitstreams/b3df6dab-7b8c-4df7-b6e3-28d323203e8c/content

BA (Honours), History — University of Calgary (2024)
* Thesis: A Common Place: Place-making in Gerrard Winstanley's Vision of the English Commons (supervised by Dr. Ken MacMillan)
* https://journalhosting.ucalgary.ca/index.php/uhj/article/view/82707/58990

## Research

### Doctoral project: medicinal commodities in the early modern Atlantic world
How drugs and medicines moved as commodities into and out of Britain across the long eighteenth century (c. 1660–1815): colonial drugs and "simples" flowing in, and manufactured medicines flowing back out to plantations, ships, and garrisons. The project asks how small medicinal commodities, many co-opted from Indigenous knowledge, fed into a larger system that helped build the infrastructure of industrialization. It brings together long-distance medicine, commodity chains, and extractivism, with a secondary thread on the philosophy of method for AI in historical research.
Planned outputs: an open knowledge graph and dataset, open-source pipeline and tools, and dissertation chapters. Methods scale up the MA pipeline substantially and add handwritten text recognition (HTR).

### NLP + GraphRAG for historical corpora
Research on a pipeline combining named-entity recognition and GraphRAG for historical corpus research, framed as a discovery, search, and ranking tool for historians rather than an automated answer machine. Includes methodological work on transcription error rates and gold-standard ground truth for early modern documents.

### OCR benchmarking
* OCR benchmark working paper — with Jim Clifford. Working Papers in Critical Search, no. 004.
* https://working-papers-in-critical-search.github.io/paper-004-ocr-benchmark/

## Talks & presentations
* AI and History Conference (American Historical Association, organized with Louis Hyman / Johns Hopkins), Baltimore, October 2026: an invited paper on a panel on AI methods, a talk on OCR and its consequences for historical practice. "Fitting Machine to Page", October 16, 2026.
* Canadian Society for Digital Humanities (CSDH), Montreal. "Reading the Unreadable: Optical Character Recognition of Early Modern Print", June 4, 2026.
* Environmental Digital Humanities Seminar (joint Lancaster / Manchester series), with Jim Clifford. "Solving OCR: Using olmOCR to Follow Commodities across the British World", March 11, 2026.

## Writing & public scholarship
"The Archive is Not a Toy: The Hidden Problems of a 'Vintage' AI", with Chloë Farr and Jessica Jack: https://activehistory.ca/blog/2026/07/13/the-archive-is-not-a-toy-the-hidden-problems-of-a-vintage-ai/. A critique of Talkie-1930, a "vintage" language model trained on pre-1930 text. It argues that the model aestheticizes a narrow, elite, colonial archival record, presents a legally motivated corpus cutoff as historically meaningful, and deploys a research tool as a public chatbot without adequate framing.

Blog series on AI and Collaboration, with Chloë Farr and Jessica Jack: https://activehistory.ca/ai-and-collaboration/. It grew out of the Talkie critique. Where Talkie extracted knowledge, the series models sharing it: short, standalone posts explaining the technologies behind computational history, each written collaboratively.
* Knowledge Graphs / Linked Open Data / GraphRAG (Jacob, lead)
* Named-entity recognition: "Stop Choosing Tools. Start Building Them." (Jacob, lead)
* OCR (Chloë Farr, lead; Jacob contributing)
* Applications (Jessica Jack, lead)
* Collaboration / wrap-up

## Digital projects & tools
**The Digital Historian's Toolbox** (in development). A curated catalogue of tools and public datasets historians have actually used, including newer AI tools, with vetted public submissions and a network graph linking studies to the tools they used. Collection, not tutorials.

**EarlyModernNER + GraphRAG pipeline** (MA thesis). An open pipeline for transcription, entity extraction, and knowledge-graph retrieval over early modern print.

## Community & service
* Vice-Chair, History Graduate Students' Association (HGSA), University of Saskatchewan
* Footnotes on Film (founder): a recurring film-and-lecture series at Saskatoon's Broadway Theatre that pairs a film with a history grad student's research, so graduate students can share their work with the public.

## Research interests (tags / keywords)
Early modern Britain · Atlantic world · history of capitalism · history of medicine · commodity history · extractivism · digital history · OCR / HTR · named-entity recognition · knowledge graphs · GraphRAG · critical AI · archives
