import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { motion } from 'framer-motion';

export function TokenSelect({ value, onChange, tokens }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-36">
        <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
          <span className="block truncate text-gray-900 dark:text-white">{value.symbol}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {tokens.map((token) => (
              <Listbox.Option
                key={token.id}
                value={token}
                className={({ active }) =>
                  'relative cursor-default select-none py-2 pl-3 pr-9 ' +
                  (active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-white')
                }
              >
                {({ active, selected }) => (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className={'block truncate ' + (selected && 'font-semibold')}>
                      {token.symbol}
                    </span>
                    {selected && (
                      <span
                        className={'absolute inset-y-0 right-0 flex items-center pr-4 ' +
                          (active ? 'text-white' : 'text-indigo-600')
                        }
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </motion.div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
