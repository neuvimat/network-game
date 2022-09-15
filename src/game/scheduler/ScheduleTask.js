/**
 * Container holding a timestamp of when the task should be executed within the scheduler containing it, the actual
 * function to perform and a priority to sort the tasks by if multiple need to happen at the same time. Tasks with
 * higher priority will be processed first.
 */
export class ScheduleTask {
    /**
     * @param {number} time
     * @param {function }task
     * @param {number} priority
     */
    constructor(time, task, priority = 0) {
        this.time = time;
        this.priority = priority; // In rare cases where we really need something to happen first
        this.task = task;

        this.enabled = true;
    }

    /**
     * Perform the actual task, unless it was disabled in the meantime
     */
    doTask() {
        if (this.enabled) {
            // Not sure if passing the fn to itself is a good idea, but maybe it can be used somehow
            this.task(this.time, this.priority, this.task);
        }
    }

    /**
     * Since how the queue used in {@link }Scheduler} is implemented, there is no simple way to remove
     * a node from it. Unless that node is at the beginning of the queue. So if we need to remove a node from the
     * queue, we don't. We mark the node as disabled instead (via a reference kept inside the place that scheduled the
     * task). When the time for the node to do something comes, it will not do anything and then get deleted. But until
     * its time comes, it will just senselessly linger in the queue. Welp, what can you do....
     */
    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }
}

/**
 * Comparator for the ScheduleTasks. Puts tasks with lesser timestamp first. If the timestamp is matching, then task
 * with higher priority first.
 * @param {ScheduleTask} a
 * @param {ScheduleTask} b
 * @return {boolean}
 */
ScheduleTask.comparator = (a, b) => {
    if (a.time === b.time) {
        return b.priority - a.priority > 0;
    }
    return b.time - a.time > 0;
};