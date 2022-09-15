import {PriorityQueue} from "Game/scheduler/PriorityQueue";
import {ScheduleTask} from "Game/scheduler/ScheduleTask";

/**
 * <p>Handles execution of tasks in the future. Each task is put into a priority queue with a timestamp. Once the process
 * method is called, all tasks with expired timestamp are executed.</p>
 * <p>To remove a task from the scheduler, you need to call {@link ScheduleTask#disable} method on the task you wish
 * to cancel. For unspecified reasons, it is impossible to browse the scheduled tasks.</p>
 */
export class Scheduler {
    constructor() {
        this.queue = new PriorityQueue(ScheduleTask.comparator);
    }

    /**
     * Little more verbose version of {@link queueScheduleTask}. Instead of passing in an instance of
     * {@link ScheduleTask}, this method will create the instance for you, add in to the queue, and return the
     * newly created task instance.
     * @param {number} time
     * @param {function} task
     * @param {number} priority
     * @return {ScheduleTask}
     */
    queueTask(time, task, priority = 0) {
        let schedule = new ScheduleTask(time, task, priority);
        this.queue.push(schedule);
        return schedule;
    }

    /**
     * Queue and already existing intance of {@link ScheduleTask}
     * @param {ScheduleTask} scheduleTask
     */
    queueScheduleTask(scheduleTask) {
        this.queue.push(scheduleTask);
    }

    /**
     * Process all messages that have expired the supplied time.
     * @param {number} time
     */
    process(time) {
        let task;
        while (true) {
            task = this.queue.peek();
            if (task && task.time <= time) {
                this.queue.pop();
                task.doTask();
            }
            else {
                break;
            }
        }
    }

    /**
     * Clean all scheduled tasks
     */
    clean() {
        this.queue = new PriorityQueue(ScheduleTask.comparator);
    }
}