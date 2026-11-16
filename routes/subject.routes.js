const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const translatorService = require('../services/translator.service');

// @route   GET /api/subjects
// @desc    Get all subjects filtered by Study Year, program, or college
// Workflow step: api(fetch) -------> User (Student/Teacher/Admin)
router.get('/', async (req, res) => {
  try {
    const { collegeId, program, year, yearName, lang } = req.query;
    const filter = {};

    if (collegeId) filter.collegeId = collegeId;
    if (program) filter.program = program;

    // Study Year selector query
    const targetYear = year || yearName;
    if (targetYear && targetYear.toLowerCase() !== 'all' && targetYear.toLowerCase() !== 'all years') {
      filter.yearName = new RegExp(targetYear, 'i');
    }

    const subjects = await Subject.find(filter).sort({ createdAt: 1 });

    // If client requested a specific language among the 9 Indian languages, format response
    const formatted = subjects.map((sub) => {
      const subObj = sub.toObject({ flattenMaps: true });
      if (lang && lang.toLowerCase() !== 'en') {
        const langCode = lang.toLowerCase();
        const subTrans = subObj.translations?.[langCode];
        if (subTrans?.name) {
          subObj.localizedName = subTrans.name;
          subObj.name = subTrans.name;
        }

        // Localize topics within units
        if (subObj.units) {
          subObj.units = subObj.units.map((u) => ({
            ...u,
            topics: u.topics.map((t) => {
              const tTrans = t.translations?.[langCode];
              return {
                ...t,
                title: tTrans?.title || t.title,
                clinicalPearls: tTrans?.clinicalPearls || t.clinicalPearls,
                keyTakeaways: tTrans?.keyTakeaways || t.keyTakeaways,
                contentMarkdown: tTrans?.contentMarkdown || t.contentMarkdown,
                localizedTitle: tTrans?.title || t.title,
                localizedClinicalPearls: tTrans?.clinicalPearls || t.clinicalPearls,
                localizedKeyTakeaways: tTrans?.keyTakeaways || t.keyTakeaways,
                localizedContentMarkdown: tTrans?.contentMarkdown || t.contentMarkdown
              };
            })
          }));
        }
      }
      return subObj;
    });

    res.json({
      success: true,
      count: formatted.length,
      selectedYear: targetYear || 'All Years',
      activeLanguage: lang || 'en',
      subjects: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/subjects/:id
// @desc    Get single subject by ID
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findOne({ id: req.params.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/subjects
// @desc    Add new subject with auto-translation to India's 9 primary languages
// Workflow step: Subjects(add+ option for teachers and admin) ----> auto translator ----> Database
router.post('/', async (req, res) => {
  try {
    const { name, code, program, yearName, iconName, color, description, collegeId } = req.body;
    if (!name || !yearName) {
      return res.status(400).json({ success: false, message: 'Subject name and Study Year are required' });
    }

    const subjectId = req.body.id || `sub-${Date.now()}`;

    // Auto-translator: Translate subject into India's 9 primary languages
    console.log(`[Auto-Translator]: Translating subject "${name}" into 9 Indian languages...`);
    const translations = await translatorService.translateSubject({ name, description });

    const newSubject = await Subject.create({
      id: subjectId,
      name,
      code: code || `PHARM-${Math.floor(100 + Math.random() * 900)}`,
      program: program || 'Pharm.D',
      yearName: yearName || '1st Year Pharm.D',
      iconName: iconName || 'Pill',
      color: color || '#006354',
      description: description || '',
      collegeId: collegeId || 'col-manipal',
      units: [],
      translations
    });

    console.log(`[Auto-Translator]: Successfully saved subject "${name}" with 9 languages to database!`);

    res.status(201).json({
      success: true,
      message: 'Subject created with auto-translations across 9 Indian languages',
      subject: newSubject
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/subjects/:id/units
// @desc    Add a unit/module to a subject
router.post('/:id/units', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Unit title is required' });
    }

    const subject = await Subject.findOne({ id: req.params.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const unitId = `unit-${Date.now()}`;
    const translations = await translatorService.translateToAll9Languages(title);

    const newUnit = {
      id: unitId,
      subjectId: subject.id,
      title,
      orderIndex: subject.units.length + 1,
      topics: [],
      translations
    };

    subject.units.push(newUnit);
    await subject.save();

    res.status(201).json({ success: true, unit: newUnit, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/subjects/:id/units/:unitId/topics
// @desc    Add a topic under a subject unit with auto-translation to India's 9 primary languages
// Workflow step: Topics(add+ options for teachers and admin) ----> auto translator ----> Database
router.post('/:id/units/:unitId/topics', async (req, res) => {
  try {
    const { title, estimatedReadMinutes, mcqCount, hasReactions, clinicalPearls, keyTakeaways, contentMarkdown, documents } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Topic title is required' });
    }

    const subject = await Subject.findOne({ id: req.params.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const unit = subject.units.find((u) => u.id === req.params.unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    const topicId = `top-${Date.now()}`;

    // Auto-translator: Translate topic title, clinical pearls, key takeaways, and content into 9 Indian languages
    console.log(`[Auto-Translator]: Translating topic "${title}" into 9 Indian languages...`);
    const translations = await translatorService.translateTopic({
      title,
      clinicalPearls: clinicalPearls || [],
      keyTakeaways: keyTakeaways || [],
      contentMarkdown: contentMarkdown || ''
    });

    const newTopic = {
      id: topicId,
      unitId: unit.id,
      title,
      estimatedReadMinutes: estimatedReadMinutes || 10,
      mcqCount: mcqCount || 5,
      hasReactions: !!hasReactions,
      clinicalPearls: clinicalPearls || [],
      keyTakeaways: keyTakeaways || [],
      contentMarkdown: contentMarkdown || '',
      documents: documents || [],
      translations
    };

    unit.topics.push(newTopic);
    await subject.save();

    console.log(`[Auto-Translator]: Successfully saved topic "${title}" with 9 languages to database!`);

    res.status(201).json({
      success: true,
      message: 'Topic created with auto-translations across 9 Indian languages',
      topic: newTopic,
      subject
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/subjects/topics/:topicId
// @desc    Update a topic and re-translate updated fields into 9 Indian languages
router.put('/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const updates = req.body;

    const subject = await Subject.findOne({ 'units.topics.id': topicId });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Topic not found in any subject' });
    }

    let foundTopic = null;
    for (const u of subject.units) {
      for (const t of u.topics) {
        if (t.id === topicId) {
          Object.assign(t, updates);

          // Re-translate if title or notes changed
          if (updates.title || updates.clinicalPearls || updates.keyTakeaways || updates.contentMarkdown) {
            console.log(`[Auto-Translator]: Re-translating updated topic "${t.title}"...`);
            const translations = await translatorService.translateTopic({
              title: t.title,
              clinicalPearls: t.clinicalPearls,
              keyTakeaways: t.keyTakeaways,
              contentMarkdown: t.contentMarkdown
            });
            t.translations = translations;
          }

          foundTopic = t;
          break;
        }
      }
    }

    await subject.save();
    res.json({ success: true, topic: foundTopic, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/subjects/topics/:topicId/documents
// @desc    Upload or attach a study document to a topic
router.post('/topics/:topicId/documents', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { name, fileUrl, fileType, fileSize, extractedText, uploadedBy } = req.body;

    if (!name || !fileUrl) {
      return res.status(400).json({ success: false, message: 'Document name and file content are required' });
    }

    const subject = await Subject.findOne({ 'units.topics.id': topicId });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Topic not found in any subject' });
    }

    let foundTopic = null;
    let newDocument = null;

    for (const u of subject.units) {
      for (const t of u.topics) {
        if (t.id === topicId) {
          if (!t.documents) t.documents = [];
          newDocument = {
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            name,
            fileUrl,
            fileType: fileType || 'application/pdf',
            fileSize: fileSize || 0,
            extractedText: extractedText || '',
            uploadedAt: new Date(),
            uploadedBy: uploadedBy || 'Faculty Preceptor'
          };
          t.documents.push(newDocument);
          foundTopic = t;
          break;
        }
      }
      if (foundTopic) break;
    }

    await subject.save();
    res.status(201).json({ success: true, document: newDocument, topic: foundTopic, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/subjects/topics/:topicId/documents/:docId
// @desc    Delete an attached document from a topic
router.delete('/topics/:topicId/documents/:docId', async (req, res) => {
  try {
    const { topicId, docId } = req.params;
    const subject = await Subject.findOne({ 'units.topics.id': topicId });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    let foundTopic = null;
    for (const u of subject.units) {
      for (const t of u.topics) {
        if (t.id === topicId) {
          if (t.documents) {
            t.documents = t.documents.filter((d) => d.id !== docId && d._id?.toString() !== docId);
          }
          foundTopic = t;
          break;
        }
      }
      if (foundTopic) break;
    }

    await subject.save();
    res.json({ success: true, message: 'Document removed from topic', topic: foundTopic, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/subjects/topics/:topicId
// @desc    Delete a topic
router.delete('/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const subject = await Subject.findOne({ 'units.topics.id': topicId });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    subject.units.forEach((u) => {
      u.topics = u.topics.filter((t) => t.id !== topicId);
    });

    await subject.save();
    res.json({ success: true, message: 'Topic deleted successfully', subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/subjects/translate-all
// @desc    Translate all existing subjects and topics in the database to 9 Indian languages
router.post('/translate-all', async (req, res) => {
  try {
    const subjects = await Subject.find();
    let subjectsUpdated = 0;
    let topicsUpdated = 0;

    for (const sub of subjects) {
      // Translate Subject
      if (!sub.translations || Object.keys(sub.translations).length < 9) {
        sub.translations = await translatorService.translateSubject({
          name: sub.name,
          description: sub.description
        });
        subjectsUpdated++;
      }

      // Translate Topics in units
      for (const unit of sub.units) {
        for (const topic of unit.topics) {
          if (!topic.translations || Object.keys(topic.translations).length < 9) {
            topic.translations = await translatorService.translateTopic({
              title: topic.title,
              clinicalPearls: topic.clinicalPearls,
              keyTakeaways: topic.keyTakeaways,
              contentMarkdown: topic.contentMarkdown
            });
            topicsUpdated++;
          }
        }
      }

      await sub.save();
    }

    res.json({
      success: true,
      message: `Batch translation complete. Updated ${subjectsUpdated} subjects and ${topicsUpdated} topics into 9 Indian languages.`,
      languages: translatorService.SUPPORTED_LANGUAGES.map((l) => `${l.name} (${l.code})`)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
