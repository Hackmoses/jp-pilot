import { lazyView } from '../lib/lazyView'
import { waitForOfflineControl } from '../lib/offline'

export const examRun = lazyView(() => import('./ExamRun').then(({ ExamRun }) => ExamRun))
export const results = lazyView(() => import('./Results').then(({ Results }) => Results))
export const calculator = lazyView(() => import('./Calculator').then(({ Calculator }) => Calculator))

export async function prepareExam() {
  await waitForOfflineControl()
  await Promise.all([examRun.preload(), results.preload(), calculator.preload()])
}
