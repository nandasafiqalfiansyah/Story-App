import { saveStory, getSavedStoryById } from '../../data/IndexedDB';

export default class ReportDetailPresenter {
  #reportId;
  #view;
  #apiModel;

  constructor(reportId, { view, apiModel }) {
    this.#reportId = reportId;
    this.#view = view;
    this.#apiModel = apiModel;
  }

  async showReportDetailMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showReportDetailMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }
  async saveReport() {
    const response = await this.#apiModel.getReportById(this.#reportId);
    console.log('response:', response);
    if (!response.ok) {
      console.error('saveReport: response:', response);
      this.#view.showSaveError(response.message);
      return;
    }
    const storyid = await getSavedStoryById(response.story.id);
    if (storyid) {
      alert('Story sudah tersimpan.');
      return;
    }

    const story = response.story;
    await saveStory(story);

    alert('Story berhasil disimpan.');
    return;
  }

  async showReportDetail() {
    this.#view.showReportDetailLoading();
    try {
      const response = await this.#apiModel.getReportById(this.#reportId);

      this.#view.populateReportDetailAndInitialMap(response.message, response.story);
    } catch (error) {
      console.error('showReportDetailAndMap: error:', error);
      this.#view.populateReportDetailError(error.message);
    } finally {
      this.#view.hideReportDetailLoading();
    }
  }

  showSaveButton() {
    if (this.#isReportSaved()) {
      this.#view.renderRemoveButton();
      return;
    }

    this.#view.renderSaveButton();
  }

  #isReportSaved() {
    return false;
  }
}
