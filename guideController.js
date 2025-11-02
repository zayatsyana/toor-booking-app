const Guide = require('../models/Guide');

class GuideController {
  static async createGuide(req, res) {
    try {
      const { full_name, experience_years, languages, bio, phone } = req.body;
      
      console.log('Creating guide:', req.body);
      
      if (!full_name) {
        return res.status(400).json({ message: 'Имя гида обязательно' });
      }

      const guideId = await Guide.create({
        full_name,
        experience_years: experience_years || 0,
        languages: languages || '',
        bio: bio || '',
        phone: phone || ''
      });
      
      res.status(201).json({ id: guideId, message: 'Гид создан' });
    } catch (error) {
      console.error('Error creating guide:', error);
      res.status(500).json({ message: 'Ошибка создания гида: ' + error.message });
    }
  }

  static async getGuides(req, res) {
    try {
      const guides = await Guide.getAll();
      res.json(guides);
    } catch (error) {
      console.error('Error getting guides:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async getGuideById(req, res) {
    try {
      const { id } = req.params;
      const guide = await Guide.getById(id);
      if (!guide) {
        return res.status(404).json({ message: 'Гид не найден' });
      }
      res.json(guide);
    } catch (error) {
      console.error('Error getting guide:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async updateGuide(req, res) {
    try {
      const { id } = req.params;
      const { full_name, experience_years, languages, bio, phone } = req.body;

      console.log('Updating guide:', id, req.body);

      const existingGuide = await Guide.getById(id);
      if (!existingGuide) {
        return res.status(404).json({ message: 'Гид не найден' });
      }

      await Guide.update(id, {
        full_name: full_name || existingGuide.full_name,
        experience_years: experience_years !== undefined ? experience_years : existingGuide.experience_years,
        languages: languages !== undefined ? languages : existingGuide.languages,
        bio: bio !== undefined ? bio : existingGuide.bio,
        phone: phone !== undefined ? phone : existingGuide.phone
      });

      res.json({ message: 'Гид обновлен' });
    } catch (error) {
      console.error('Error updating guide:', error);
      res.status(500).json({ message: 'Ошибка обновления гида: ' + error.message });
    }
  }

  static async deleteGuide(req, res) {
    try {
      const { id } = req.params;

      const existingGuide = await Guide.getById(id);
      if (!existingGuide) {
        return res.status(404).json({ message: 'Гид не найден' });
      }

      await Guide.delete(id);
      res.json({ message: 'Гид удален' });
    } catch (error) {
      console.error('Error deleting guide:', error);
      res.status(500).json({ message: 'Ошибка удаления гида' });
    }
  }
}

module.exports = GuideController;