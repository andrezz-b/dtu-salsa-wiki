## Loading Obsidian Data
1. How does decap store new moves/concepts?
  - Slugs?
  - Relations, what should be saved in the frontmatter?
  - How does it look in the astro page?

2. Choose some finalized obsidian moves/concepts
  - Vuleta, Enchufla, Dile que no, Cuba, Dile que no position
  - They should be related to each other

3. Build import script
  - slug should follow the decap cms slug format
  - Convert obsidian links in the text `[[move]]` to normal markdown links
  - Convert relation links in the frontmatter to decap relations format
  - Moves/concepts referenced in the text should be added to the relations frontmatter (if not already present)
  - Convert tab indents to spaces
  - File name should be title, new files should be saved with the slug