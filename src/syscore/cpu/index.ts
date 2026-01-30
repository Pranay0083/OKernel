import { roundRobin } from './algos/round_robin';
import { sjf } from './algos/sjf';
import { fcfs } from './algos/fcfs';
import { srtf } from './algos/srtf';
import { priority } from './algos/priority';
import { Process } from '../../core/types';

export const algos = {
    RR: roundRobin,
    SJF: sjf,
    FCFS: fcfs,
    SRTF: srtf,
    PRIORITY: priority
};

export const getAlgo = (code: string) => {
    return algos[code as keyof typeof algos] || algos.FCFS;
};
