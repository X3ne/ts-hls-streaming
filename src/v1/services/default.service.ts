import { components } from './openapi/generated'

const getDefault = async () => {
  return {
    message: 'Hello World!',
  }
}

const createDefault = async (
  create: components['schemas']['DefaultPostModel'],
) => {
  return {
    message: `Created ${create.name}!`,
  }
}

const updateDefault = async (
  patch: components['schemas']['DefaultPatchModel'],
) => {
  return {
    message: `Updated ${patch.name}!`,
  }
}

const deleteDefault = async () => {
  return {
    message: 'Deleted!',
  }
}

export default {
  getDefault,
  createDefault,
  updateDefault,
  deleteDefault,
}
