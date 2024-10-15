/* eslint-disable no-restricted-globals */
import { processFile } from '@/utils/import';
import { formatPapers } from "@/utils/common";

self.onmessage = ({ data: { content, preprocess } }) => {
    processFile(content, preprocess)
        .then((processed) => {
            self.postMessage(formatPapers(processed));
        });
};
